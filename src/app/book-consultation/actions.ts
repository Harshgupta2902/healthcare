"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  assertGuestBookingRateLimits,
  deviceHashZodField,
  getClientIpFromHeaders,
} from "@/lib/device-rate-limit";
import { zodFirstError } from "@/lib/server-action-result";
import { fetchGuestAppointmentProfessionalMeta } from "@/lib/guest-appointment-professional-meta";
import { formatProfessionalDisplayName } from "@/lib/professional-name-title";
import { formatBookingDateLabel, formatBookingTimeLabel } from "@/lib/booking-display";
import {
  ageFromDateOfBirth,
  normalizeBookingPhone,
  splitFullName,
  type BookingFormPrefill,
} from "@/lib/booking-profile-prefill";
import indianCities from "@/data/indian-cities.json";

const placesSearchSchema = z.object({
  input: z.string().min(1, "Input is required").max(100, "Input too long"),
});

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

type IndianCityRow = (typeof indianCities)[number];

function toPlacePrediction(c: IndianCityRow): PlacePrediction {
  return {
    place_id: `in-city-${c.id}`,
    description: `${c.name}, ${c.state}, India`,
    structured_formatting: {
      main_text: c.name,
      secondary_text: c.state,
    },
  };
}

const MAX_RESULTS = 25;

/** Local search over bundled Indian cities (no external Places API). */
export async function searchPlaces(input: string): Promise<PlacePrediction[]> {
  const validation = placesSearchSchema.safeParse({ input });
  if (!validation.success) {
    return [];
  }

  const q = validation.data.input.trim().toLowerCase();
  if (!q) {
    return [];
  }

  const scored: { row: IndianCityRow; score: number }[] = [];

  for (const row of indianCities) {
    const name = row.name.toLowerCase();
    const state = row.state.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (state.startsWith(q)) score = 40;
    else if (state.includes(q)) score = 20;
    else continue;
    scored.push({ row, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.row.name.localeCompare(b.row.name);
  });

  const seen = new Set<string>();
  const out: PlacePrediction[] = [];
  for (const { row } of scored) {
    const key = `${row.name}\0${row.state}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(toPlacePrediction(row));
    if (out.length >= MAX_RESULTS) break;
  }

  return out;
}

// ============================================
// Submit Guest Appointment
// ============================================

const guestAppointmentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  age: z.coerce.number().int().min(0, "Age cannot be negative").max(120, "Age must be 120 or less"),
  phone: z.string().min(10, "Phone number is required").max(10, "Phone must be exactly 10 digits"),
  email: z.string().email("Enter a valid email address"),
  category: z.string().min(1, "Medical category is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  date: z.string().min(1, "Preferred date is required"), // yyyy-mm-dd
  time: z.string().min(1, "Preferred time is required"), // HH:mm
  message: z.string().optional().nullable(),
  /** Required — professional `users.id` from consultant selection (`?cref=`). */
  professionalId: z.string().uuid("Please select a consultant before booking."),
  deviceHash: deviceHashZodField,
});

export async function submitGuestAppointment(form: unknown) {
  const validated = guestAppointmentSchema.safeParse(form);
  if (!validated.success) {
    return { error: zodFirstError(validated.error) };
  }

  const headerStore = await headers();
  const clientIp = getClientIpFromHeaders(headerStore);
  const rateLimit = await assertGuestBookingRateLimits({
    ip: clientIp,
    deviceHash: validated.data.deviceHash,
    email: validated.data.email,
  });
  if (!rateLimit.ok) {
    return { error: rateLimit.error, code: rateLimit.reason };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    first_name: validated.data.firstName,
    last_name: validated.data.lastName,
    age: validated.data.age,
    phone: validated.data.phone,
    email: validated.data.email,
    category: validated.data.category,
    state: validated.data.state,
    city: validated.data.city,
    appointment_date: validated.data.date,
    appointment_time: validated.data.time,
    message: validated.data.message ?? null,
    created_by: user?.id ?? null,
    professional_id: validated.data.professionalId,
  };

  const { data, error } = await supabase.from("guest_appointments").insert(payload).select("id").single();
  if (error) {
    console.error("❌ [SERVER ACTION] submitGuestAppointment error:", error);
    return { error: error.message };
  }
  return { success: true, id: data.id };
}

const guestBookingStepIdSchema = z.object({
  guestAppointmentId: z.string().uuid('Invalid booking reference.'),
});

const guestMeetingPersistSchema = guestBookingStepIdSchema.extend({
  meetUrl: z.string().url('Invalid meeting URL').max(4000),
  provider: z.enum(['google', 'jitsi']),
});

async function requireBookingSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'You must be signed in.' };
  return { ok: true as const, supabase, userId: user.id };
}

async function assertGuestAppointmentOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  guestAppointmentId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from('guest_appointments')
    .select('created_by')
    .eq('id', guestAppointmentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Appointment not found.');
  if (data.created_by !== userId) throw new Error('You do not have access to this booking.');
}

/** Step 2: Validate appointment and load patient/consultant details. */
export async function bookConsultationMeetingValidateStep(input: unknown) {
  const auth = await requireBookingSession();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = guestBookingStepIdSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) };

  try {
    await assertGuestAppointmentOwner(auth.supabase, parsed.data.guestAppointmentId, auth.userId);
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline');
    const ctx = await pipeline.loadGuestMeetingContext(auth.supabase, parsed.data.guestAppointmentId);
    return {
      success: true as const,
      patientName: ctx.guestName,
      patientEmail: ctx.guestEmail,
      consultantName: ctx.professionalName,
      consultantEmail: ctx.professionalEmail,
    };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Validation failed.',
    };
  }
}

/** Step 3: Create Google Meet or Jitsi meeting link. */
export async function bookConsultationMeetingCreateLinkStep(input: unknown) {
  const auth = await requireBookingSession();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = guestBookingStepIdSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) };

  try {
    await assertGuestAppointmentOwner(auth.supabase, parsed.data.guestAppointmentId, auth.userId);
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline');
    const ctx = await pipeline.loadGuestMeetingContext(auth.supabase, parsed.data.guestAppointmentId);
    const { meetUrl, provider } = await pipeline.generateGuestMeetingLink(ctx);
    return {
      success: true as const,
      meetUrl,
      provider,
      providerLabel: provider === 'google' ? 'Google Meet' : 'Jitsi',
    };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Could not create meeting link.',
    };
  }
}

/** Step 4: Email invite to patient (Jitsi path only). */
export async function bookConsultationMeetingEmailPatientStep(input: unknown) {
  const auth = await requireBookingSession();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = guestMeetingPersistSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) };
  if (parsed.data.provider !== 'jitsi') {
    return { success: true as const, skipped: true as const };
  }

  try {
    await assertGuestAppointmentOwner(auth.supabase, parsed.data.guestAppointmentId, auth.userId);
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline');
    const ctx = await pipeline.loadGuestMeetingContext(auth.supabase, parsed.data.guestAppointmentId);
    pipeline.assertMeetUrlForAppointment(
      parsed.data.guestAppointmentId,
      parsed.data.meetUrl,
      parsed.data.provider,
    );
    await pipeline.emailGuestMeetingInvitePatient(ctx, parsed.data.meetUrl);
    return { success: true as const, skipped: false as const, sentTo: ctx.guestEmail };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Could not email the patient.',
    };
  }
}

/** Step 5: Email invite to consultant (Jitsi path only). */
export async function bookConsultationMeetingEmailConsultantStep(input: unknown) {
  const auth = await requireBookingSession();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = guestMeetingPersistSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) };
  if (parsed.data.provider !== 'jitsi') {
    return { success: true as const, skipped: true as const };
  }

  try {
    await assertGuestAppointmentOwner(auth.supabase, parsed.data.guestAppointmentId, auth.userId);
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline');
    const ctx = await pipeline.loadGuestMeetingContext(auth.supabase, parsed.data.guestAppointmentId);
    pipeline.assertMeetUrlForAppointment(
      parsed.data.guestAppointmentId,
      parsed.data.meetUrl,
      parsed.data.provider,
    );
    await pipeline.emailGuestMeetingInviteConsultant(ctx, parsed.data.meetUrl);
    return { success: true as const, skipped: false as const, sentTo: ctx.professionalEmail };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Could not email the consultant.',
    };
  }
}

/** Step 6: Persist meeting URL on the appointment. */
export async function bookConsultationMeetingSaveStep(input: unknown) {
  const auth = await requireBookingSession();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = guestMeetingPersistSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) };

  try {
    await assertGuestAppointmentOwner(auth.supabase, parsed.data.guestAppointmentId, auth.userId);
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline');
    const ctx = await pipeline.loadGuestMeetingContext(auth.supabase, parsed.data.guestAppointmentId);
    pipeline.assertMeetUrlForAppointment(
      parsed.data.guestAppointmentId,
      parsed.data.meetUrl,
      parsed.data.provider,
    );
    await pipeline.saveGuestMeetingUrl(
      auth.supabase,
      parsed.data.guestAppointmentId,
      parsed.data.meetUrl,
      pipeline.meetingTitleForContext(ctx),
    );
    return { success: true as const, meetUrl: parsed.data.meetUrl };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Could not save meeting link.',
    };
  }
}

// ============================================
// Prefill booking form from signed-in profile
// ============================================

export async function getBookingFormPrefill(): Promise<{ prefill: BookingFormPrefill | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { prefill: null };
  }

  const [{ data: coreProfile }, { data: medProfile }] = await Promise.all([
    supabase.from("users").select("name, email, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("client_medical_profiles")
      .select("date_of_birth, city, state")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const prefill: BookingFormPrefill = {};
  const displayName =
    (coreProfile?.name as string | undefined)?.trim() ||
    (user.user_metadata?.name as string | undefined)?.trim() ||
    "";

  if (displayName) {
    const { firstName, lastName } = splitFullName(displayName);
    if (firstName.length >= 2) prefill.firstName = firstName;
    if (lastName.length >= 2) prefill.lastName = lastName;
  }

  const email = ((coreProfile?.email as string | undefined) || user.email || "").trim();
  if (email) prefill.email = email;

  const phone = normalizeBookingPhone(coreProfile?.phone as string | null);
  if (phone) prefill.phone = phone;

  const dob = (medProfile?.date_of_birth as string | null | undefined)?.trim();
  if (dob) {
    const age = ageFromDateOfBirth(dob);
    if (age != null) prefill.age = age;
  }

  const city = (medProfile?.city as string | null | undefined)?.trim();
  const state = (medProfile?.state as string | null | undefined)?.trim();
  if (city) prefill.city = city;
  if (state) prefill.state = state;

  const hasAny = Object.keys(prefill).length > 0;
  return { prefill: hasAny ? prefill : null };
}

// ============================================
// Guest appointment confirmation (success page)
// ============================================

const appointmentIdSchema = z.string().uuid();

export type GuestAppointmentConfirmation = {
  consultantLabel: string;
  dateLabel: string;
  timeLabel: string;
};

type ConfirmationRpcRow = {
  id: string;
  category: string | null;
  appointment_date: string;
  appointment_time: string;
  professional_id: string | null;
};

export async function getGuestAppointmentConfirmation(
  appointmentId: string,
): Promise<{ success: true; data: GuestAppointmentConfirmation } | { error: string }> {
  const parsed = appointmentIdSchema.safeParse(appointmentId);
  if (!parsed.success) {
    return { error: "Invalid booking reference." };
  }

  const supabase = await createClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc("get_guest_appointment_confirmation", {
    p_id: parsed.data,
  });

  if (rpcError) {
    console.error("[getGuestAppointmentConfirmation] rpc error:", rpcError);
    return { error: "Confirmation is temporarily unavailable." };
  }

  const row = rpcData as ConfirmationRpcRow | null;
  if (!row?.id) {
    return { error: "Booking not found." };
  }

  let consultantLabel = row.category?.trim() || "Your specialist";

  if (row.professional_id) {
    const meta = await fetchGuestAppointmentProfessionalMeta(supabase, [row.professional_id]);
    const prof = meta[row.professional_id];
    if (prof?.name) {
      const { data: profile } = await supabase
        .from("professional_profiles")
        .select("name_title")
        .eq("user_id", row.professional_id)
        .maybeSingle();
      const formatted = formatProfessionalDisplayName(prof.name, profile?.name_title ?? null);
      consultantLabel = formatted || prof.name;
    }
  }

  return {
    success: true,
    data: {
      consultantLabel,
      dateLabel: formatBookingDateLabel(row.appointment_date as string),
      timeLabel: formatBookingTimeLabel(row.appointment_time as string),
    },
  };
}
