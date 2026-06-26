"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchGuestAppointmentProfessionalMeta } from "@/lib/guest-appointment-professional-meta";
import { formatProfessionalDisplayName } from "@/lib/professional-name-title";
import { zodFirstError } from "@/lib/server-action-result";
import { requireClientForBooking } from "@/lib/booking/require-client-booking";
import {
  attachSharedPrescriptionsSchema,
  eligiblePrescriptionsQuerySchema,
  guestAppointmentIdSchema,
} from "./schemas";
import type { EligiblePrescriptionItem, SharedPrescriptionItem } from "./types";
import { MAX_SHARED_PRESCRIPTIONS } from "./types";

type GuestPrescriptionRow = {
  id: string;
  category: string;
  appointment_date: string;
  appointment_time: string;
  prescription_updated_at: string | null;
  professional_id: string | null;
  created_by: string | null;
  email: string;
  prescription_html: string | null;
};

async function requireAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  return { ok: true as const, supabase, user };
}

async function loadOwnedPrescriptionRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userEmail: string | undefined,
  emailFilter?: string,
) {
  const { data: byCreator, error: creatorError } = await supabase
    .from("guest_appointments")
    .select(
      "id, category, appointment_date, appointment_time, prescription_updated_at, professional_id, created_by, email, prescription_html",
    )
    .eq("created_by", userId)
    .not("prescription_html", "is", null)
    .order("prescription_updated_at", { ascending: false });

  if (creatorError) throw new Error(creatorError.message);

  const matchEmail = (emailFilter ?? userEmail ?? "").trim().toLowerCase();
  let byEmail: GuestPrescriptionRow[] = [];

  if (matchEmail) {
    const { data, error } = await supabase
      .from("guest_appointments")
      .select(
        "id, category, appointment_date, appointment_time, prescription_updated_at, professional_id, created_by, email, prescription_html",
      )
      .ilike("email", matchEmail)
      .not("prescription_html", "is", null)
      .order("prescription_updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    byEmail = (data ?? []) as GuestPrescriptionRow[];
  }

  const merged = new Map<string, GuestPrescriptionRow>();
  for (const row of [...((byCreator ?? []) as GuestPrescriptionRow[]), ...byEmail]) {
    const html = row.prescription_html?.trim();
    if (!html) continue;
    merged.set(row.id, row);
  }

  return Array.from(merged.values())
    .sort((a, b) => {
      const aTime = a.prescription_updated_at ? new Date(a.prescription_updated_at).getTime() : 0;
      const bTime = b.prescription_updated_at ? new Date(b.prescription_updated_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, MAX_SHARED_PRESCRIPTIONS);
}

async function mapPrescriptionRowsToItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: GuestPrescriptionRow[],
): Promise<EligiblePrescriptionItem[]> {
  const professionalIds = Array.from(
    new Set(rows.map((row) => row.professional_id).filter(Boolean) as string[]),
  );
  const meta = await fetchGuestAppointmentProfessionalMeta(supabase, professionalIds);

  const profileTitles = await Promise.all(
    professionalIds.map(async (id) => {
      const { data: profile } = await supabase
        .from("professional_profiles")
        .select("name_title")
        .eq("user_id", id)
        .maybeSingle();
      return { id, nameTitle: profile?.name_title ?? null };
    }),
  );
  const titleById = Object.fromEntries(profileTitles.map((p) => [p.id, p.nameTitle]));

  return rows.map((row) => {
    const prof = row.professional_id ? meta[row.professional_id] : undefined;
    const professionalName = prof?.name
      ? formatProfessionalDisplayName(prof.name, titleById[row.professional_id!] ?? null) || prof.name
      : null;

    return {
      id: row.id,
      category: row.category,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      prescriptionUpdatedAt: row.prescription_updated_at,
      professionalName,
    };
  });
}

/** Returns up to the 5 most recent prior prescriptions when the patient has any on file. */
export async function getEligiblePrescriptionsForSharing(input?: unknown) {
  const parsed = eligiblePrescriptionsQuerySchema.safeParse(input ?? {});
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await requireClientForBooking();
  if (!auth.ok) return { error: auth.error };

  try {
    const rows = await loadOwnedPrescriptionRows(
      auth.supabase,
      auth.user.id,
      auth.user.email,
      parsed.data.email,
    );

    if (rows.length === 0) {
      return { success: true as const, prescriptions: [] as EligiblePrescriptionItem[] };
    }

    const prescriptions = await mapPrescriptionRowsToItems(auth.supabase, rows);
    return { success: true as const, prescriptions };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not load prior prescriptions.",
    };
  }
}

export async function attachSharedPrescriptionsToBooking(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userEmail: string | undefined,
  guestAppointmentId: string,
  sharedPrescriptionIds: string[],
) {
  const parsed = attachSharedPrescriptionsSchema.safeParse({
    guestAppointmentId,
    sharedPrescriptionIds,
  });
  if (!parsed.success) {
    throw new Error(zodFirstError(parsed.error));
  }

  const ownedRows = await loadOwnedPrescriptionRows(supabase, userId, userEmail);
  const ownedIds = new Set(ownedRows.map((row) => row.id));

  for (const sourceId of parsed.data.sharedPrescriptionIds) {
    if (sourceId === guestAppointmentId) {
      throw new Error("Cannot share a prescription from the same booking.");
    }
    if (!ownedIds.has(sourceId)) {
      throw new Error("One or more selected prescriptions are not available to share.");
    }
  }

  const { data: attached, error: rpcError } = await supabase.rpc(
    "attach_guest_appointment_prescription_shares",
    {
      p_guest_appointment_id: guestAppointmentId,
      p_source_ids: parsed.data.sharedPrescriptionIds,
    },
  );

  if (rpcError) {
    const migrationHint =
      rpcError.message.includes("attach_guest_appointment_prescription_shares") ||
      rpcError.message.includes("guest_appointment_prescription_shares")
        ? " Apply the prescription sharing migration from updates.sql in Supabase."
        : "";
    throw new Error(`${rpcError.message}${migrationHint}`);
  }

  if (attached !== true) {
    throw new Error(
      "Could not attach shared prescriptions to your booking. Ensure database migrations are applied.",
    );
  }
}

export async function getSharedPrescriptionsForGuestAppointment(input: unknown) {
  const parsed = guestAppointmentIdSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await requireAuthUser();
  if (!auth.ok) return { error: auth.error };

  const { data: rpcRows, error: rpcError } = await auth.supabase.rpc(
    "get_shared_prescriptions_for_professional_booking",
    { p_guest_appointment_id: parsed.data.guestAppointmentId },
  );

  if (rpcError) return { error: rpcError.message };

  type RpcShareRow = {
    id: string;
    sourceGuestAppointmentId: string;
    category: string;
    appointmentDate: string;
    appointmentTime: string;
    prescriptionUpdatedAt: string | null;
    prescriptionHtml: string;
    consentedAt: string;
    professionalId: string | null;
  };

  const shareItems = (Array.isArray(rpcRows) ? rpcRows : []) as RpcShareRow[];

  if (shareItems.length === 0) {
    return { success: true as const, prescriptions: [] as SharedPrescriptionItem[] };
  }

  const professionalIds = Array.from(
    new Set(shareItems.map((row) => row.professionalId).filter(Boolean) as string[]),
  );
  const meta = await fetchGuestAppointmentProfessionalMeta(auth.supabase, professionalIds);
  const profileTitles = await Promise.all(
    professionalIds.map(async (id) => {
      const { data: profile } = await auth.supabase
        .from("professional_profiles")
        .select("name_title")
        .eq("user_id", id)
        .maybeSingle();
      return { id, nameTitle: profile?.name_title ?? null };
    }),
  );
  const titleById = Object.fromEntries(profileTitles.map((p) => [p.id, p.nameTitle]));

  const prescriptions: SharedPrescriptionItem[] = shareItems.map((row) => {
    const prof = row.professionalId ? meta[row.professionalId] : undefined;
    const professionalName = prof?.name
      ? formatProfessionalDisplayName(prof.name, titleById[row.professionalId!] ?? null) || prof.name
      : null;

    return {
      id: row.id,
      sourceGuestAppointmentId: row.sourceGuestAppointmentId,
      category: row.category,
      appointmentDate: row.appointmentDate,
      appointmentTime: row.appointmentTime,
      prescriptionUpdatedAt: row.prescriptionUpdatedAt,
      professionalName,
      prescriptionHtml: row.prescriptionHtml,
      consentedAt: row.consentedAt,
    };
  });

  return { success: true as const, prescriptions };
}

export async function fetchSharedPrescriptionCountsByGuestAppointmentIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  guestAppointmentIds: string[],
): Promise<Record<string, number>> {
  if (guestAppointmentIds.length === 0) return {};

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_professional_prescription_share_counts",
    { p_guest_ids: guestAppointmentIds },
  );

  if (!rpcError && rpcData && typeof rpcData === "object") {
    const counts: Record<string, number> = {};
    for (const [id, count] of Object.entries(rpcData as Record<string, number>)) {
      counts[id] = Number(count) || 0;
    }
    // Professional-only RPC returns {} for patients; fall through to direct read.
    if (Object.keys(counts).length > 0) {
      return counts;
    }
  }

  const { data, error } = await supabase
    .from("guest_appointment_prescription_shares")
    .select("guest_appointment_id")
    .in("guest_appointment_id", guestAppointmentIds);

  if (error) {
    const isMissingTable =
      error.code === "PGRST205" ||
      error.message.includes("guest_appointment_prescription_shares");
    if (isMissingTable) return {};
    throw new Error(error.message);
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = row.guest_appointment_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }

  return counts;
}
