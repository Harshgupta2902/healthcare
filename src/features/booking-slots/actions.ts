"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_BOOKING_SETTINGS,
  parseBookingSettings,
  type BookingSettings,
} from "@/lib/booking-settings";
import {
  buildBookableSlots,
  diagnoseSlotGeneration,
  isValidHourlyAvailabilityWindow,
  slotStartToAppointmentFields,
} from "@/lib/booking/slots";
import {
  formatBookableDayLabels,
  isYmdBookable,
  listBookableDates,
} from "@/lib/booking/bookable-dates";
import { zodFirstError } from "@/lib/server-action-result";
import {
  resolveClientBookingAuth,
  type BookingActionAuth,
} from "@/lib/booking/action-auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  activeHoldSchema,
  holdIdSchema,
  professionalDateSchema,
  reserveSlotSchema,
} from "./schemas";

export type GetBookableDatesResult =
  | { error: string }
  | {
      success: true;
      dates: string[];
      availableDayLabels: string;
      advanceWeeks: number;
      hasAvailability: boolean;
      hasValidSlotWindows: boolean;
    };

export type GetAvailableSlotsResult =
  | { error: string }
  | {
      success: true;
      slots: ReturnType<typeof buildBookableSlots>;
      settings: BookingSettings;
      myHoldSlotStartAt: string | null;
      debug: ReturnType<typeof diagnoseSlotGeneration>;
      emptyReason: ReturnType<typeof diagnoseSlotGeneration>["emptyReason"] | "occupied_only" | null;
    };

export async function fetchBookingSettings(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<BookingSettings> {
  const { data, error } = await supabase.rpc("get_booking_settings");
  if (error) {
    console.error("[fetchBookingSettings]", error);
    return DEFAULT_BOOKING_SETTINGS;
  }
  return parseBookingSettings(data);
}

export async function getBookingSettings() {
  const supabase = await createClient();
  const settings = await fetchBookingSettings(supabase);
  return { success: true as const, settings };
}

async function loadProfessionalAvailabilityDays(
  supabase: Awaited<ReturnType<typeof createClient>>,
  professionalId: string,
) {
  const { data, error } = await supabase
    .from("professional_availability")
    .select("day_of_week, start_time, end_time, is_available")
    .eq("professional_id", professionalId);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter(
      (row) =>
        row.is_available &&
        isValidHourlyAvailabilityWindow(
          String(row.start_time ?? ""),
          String(row.end_time ?? ""),
        ),
    )
    .map((row) => Number(row.day_of_week));
}

export async function getBookableDates(
  input: unknown,
  supabaseOverride?: SupabaseClient,
): Promise<GetBookableDatesResult> {
  const parsed = z
    .object({ professionalId: z.string().uuid("Invalid consultant.") })
    .safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const supabase = supabaseOverride ?? (await createClient());
  const settings = await fetchBookingSettings(supabase);

  try {
    const { data: rows, error: rowsError } = await supabase
      .from("professional_availability")
      .select("day_of_week, start_time, end_time, is_available")
      .eq("professional_id", parsed.data.professionalId);

    if (rowsError) throw new Error(rowsError.message);

    const availableRows = (rows ?? []).filter((row) => row.is_available);
    const availableDays = availableRows
      .filter((row) =>
        isValidHourlyAvailabilityWindow(
          String(row.start_time ?? ""),
          String(row.end_time ?? ""),
        ),
      )
      .map((row) => Number(row.day_of_week));

    const dates = listBookableDates(availableDays, settings.booking_advance_weeks);

    return {
      success: true as const,
      dates,
      availableDayLabels: formatBookableDayLabels(availableDays),
      advanceWeeks: settings.booking_advance_weeks,
      hasAvailability: availableRows.length > 0,
      hasValidSlotWindows: availableDays.length > 0,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not load bookable dates." };
  }
}

export async function getAvailableSlots(
  input: unknown,
  auth?: BookingActionAuth,
): Promise<GetAvailableSlotsResult> {
  const parsed = professionalDateSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const supabase = auth?.supabase ?? (await createClient());
  await supabase.rpc("expire_stale_slot_reservations");

  const settings = await fetchBookingSettings(supabase);
  let availableDays: number[] = [];
  try {
    availableDays = await loadProfessionalAvailabilityDays(supabase, parsed.data.professionalId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not load availability." };
  }

  if (!isYmdBookable(parsed.data.date, availableDays, settings.booking_advance_weeks)) {
    return { error: "This date is not available for booking with this consultant." };
  }

  const [{ data: availability, error: availError }, { data: occupied, error: occError }] =
    await Promise.all([
      supabase
        .from("professional_availability")
        .select("day_of_week, start_time, end_time, is_available")
        .eq("professional_id", parsed.data.professionalId),
      supabase
        .from("professional_slot_reservations")
        .select("slot_start_at, status, expires_at")
        .eq("professional_id", parsed.data.professionalId)
        .in("status", ["held", "confirmed"])
        .gte("slot_start_at", `${parsed.data.date}T00:00:00+05:30`)
        .lt("slot_start_at", `${parsed.data.date}T23:59:59+05:30`),
    ]);

  if (availError) return { error: availError.message };
  if (occError) return { error: occError.message };

  const userId = auth?.user.id ?? (await supabase.auth.getUser()).data.user?.id;
  let myHoldSlotStartAt: string | null = null;

  if (userId) {
    const { data: myHold } = await supabase
      .from("professional_slot_reservations")
      .select("slot_start_at")
      .eq("professional_id", parsed.data.professionalId)
      .eq("held_by_user_id", userId)
      .eq("status", "held")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    myHoldSlotStartAt = (myHold?.slot_start_at as string | undefined) ?? null;
  }

  const mappedAvailability = (availability ?? []).map((row) => ({
    dayOfWeek: Number(row.day_of_week),
    startTime: String(row.start_time ?? ""),
    endTime: String(row.end_time ?? ""),
    isAvailable: Boolean(row.is_available),
  }));

  const debug = diagnoseSlotGeneration({
    dateYmd: parsed.data.date,
    availability: mappedAvailability,
  });

  const slots = buildBookableSlots({
    dateYmd: parsed.data.date,
    availability: mappedAvailability,
    occupied: (occupied ?? []).map((row) => ({
      slotStartAt: row.slot_start_at as string,
      status: row.status as "held" | "confirmed",
      expiresAt: row.expires_at as string,
    })),
    myHoldSlotStartAt,
  });

  const availableCount = slots.filter((s) => s.state === "available").length;

  return {
    success: true as const,
    slots,
    settings,
    myHoldSlotStartAt,
    debug,
    emptyReason:
      slots.length === 0
        ? debug.emptyReason
        : availableCount === 0
          ? ("occupied_only" as const)
          : null,
  };
}

export async function reserveSlot(input: unknown, authOverride?: BookingActionAuth) {
  const parsed = reserveSlotSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await resolveClientBookingAuth(authOverride);
  if (!auth.ok) return { error: auth.error, ...(auth.role ? { code: "wrong_role" as const } : {}) };

  const settings = await fetchBookingSettings(auth.supabase);
  const { date: slotDate } = slotStartToAppointmentFields(parsed.data.slotStartAt);
  let availableDays: number[] = [];
  try {
    availableDays = await loadProfessionalAvailabilityDays(
      auth.supabase,
      parsed.data.professionalId,
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not load availability." };
  }

  if (!isYmdBookable(slotDate, availableDays, settings.booking_advance_weeks)) {
    return { error: "This date is not available for booking." };
  }

  const { data, error } = await auth.supabase.rpc("reserve_professional_slot", {
    p_professional_id: parsed.data.professionalId,
    p_slot_start_at: parsed.data.slotStartAt,
  });

  if (error) return { error: error.message };

  const result = data as {
    ok?: boolean;
    error?: string;
    hold_id?: string;
    expires_at?: string;
    slot_start_at?: string;
    slot_end_at?: string;
  };

  if (!result?.ok || !result.hold_id) {
    return { error: result?.error ?? "Could not reserve this slot." };
  }

  const { date, time } = slotStartToAppointmentFields(result.slot_start_at!);

  return {
    success: true as const,
    holdId: result.hold_id,
    expiresAt: result.expires_at!,
    slotStartAt: result.slot_start_at!,
    slotEndAt: result.slot_end_at!,
    date,
    time,
  };
}

export async function releaseSlot(input: unknown, authOverride?: BookingActionAuth) {
  const parsed = holdIdSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await resolveClientBookingAuth(authOverride);
  if (!auth.ok) return { error: auth.error, ...(auth.role ? { code: "wrong_role" as const } : {}) };

  const { data, error } = await auth.supabase.rpc("release_slot_reservation", {
    p_hold_id: parsed.data.holdId,
  });

  if (error) return { error: error.message };
  if (!data) return { error: "Could not release this slot hold." };
  return { success: true as const };
}

export async function getMyActiveHold(input: unknown, authOverride?: BookingActionAuth) {
  const parsed = activeHoldSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await resolveClientBookingAuth(authOverride);
  if (!auth.ok) return { error: auth.error, ...(auth.role ? { code: "wrong_role" as const } : {}) };

  await auth.supabase.rpc("expire_stale_slot_reservations");

  const { data, error } = await auth.supabase
    .from("professional_slot_reservations")
    .select("id, slot_start_at, slot_end_at, expires_at")
    .eq("professional_id", parsed.data.professionalId)
    .eq("held_by_user_id", auth.user.id)
    .eq("status", "held")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { success: true as const, hold: null };

  const { date, time } = slotStartToAppointmentFields(data.slot_start_at as string);

  return {
    success: true as const,
    hold: {
      holdId: data.id as string,
      slotStartAt: data.slot_start_at as string,
      slotEndAt: data.slot_end_at as string,
      expiresAt: data.expires_at as string,
      date,
      time,
    },
  };
}

export async function verifySlotHoldForBooking(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  holdId: string,
  professionalId: string,
  date: string,
  time: string,
) {
  await supabase.rpc("expire_stale_slot_reservations");

  const { data: hold, error } = await supabase
    .from("professional_slot_reservations")
    .select("id, professional_id, slot_start_at, status, expires_at, held_by_user_id")
    .eq("id", holdId)
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message };
  if (!hold) return { ok: false as const, error: "Slot reservation not found. Please select a slot again." };
  if (hold.status !== "held") {
    return { ok: false as const, error: "This slot reservation is no longer active." };
  }
  if (hold.held_by_user_id !== userId) {
    return { ok: false as const, error: "This slot hold belongs to another session." };
  }
  if (hold.professional_id !== professionalId) {
    return { ok: false as const, error: "Slot does not match the selected consultant." };
  }
  if (new Date(hold.expires_at as string).getTime() < Date.now()) {
    return { ok: false as const, error: "Your slot hold has expired. Please select a slot again." };
  }

  const { date: slotDate, time: slotTime } = slotStartToAppointmentFields(hold.slot_start_at as string);
  if (slotDate !== date || slotTime !== time) {
    return { ok: false as const, error: "Selected time does not match your reserved slot." };
  }

  return {
    ok: true as const,
    hold: {
      id: hold.id as string,
      expiresAt: hold.expires_at as string,
      slotStartAt: hold.slot_start_at as string,
    },
  };
}
