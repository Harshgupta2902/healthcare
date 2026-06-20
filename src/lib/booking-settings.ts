import { z } from "zod";

export const BOOKING_SETTINGS_KEY = "booking";

export const MEETING_DURATION_OPTIONS = [30, 40, 50, 60] as const;

export const BOOKING_ADVANCE_WEEKS_OPTIONS = [1, 2, 3] as const;

export const bookingSettingsSchema = z.object({
  slot_hold_minutes: z.number().int().min(5).max(30).default(10),
  meeting_duration_minutes: z
    .union([
      z.literal(30),
      z.literal(40),
      z.literal(50),
      z.literal(60),
    ])
    .default(60),
  booking_advance_weeks: z
    .union([z.literal(1), z.literal(2), z.literal(3)])
    .default(2),
});

export type BookingSettings = z.infer<typeof bookingSettingsSchema>;

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  slot_hold_minutes: 10,
  meeting_duration_minutes: 60,
  booking_advance_weeks: 2,
};

export function parseBookingSettings(value: unknown): BookingSettings {
  const raw =
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

  const parsed = bookingSettingsSchema.safeParse({
    slot_hold_minutes: raw.slot_hold_minutes,
    meeting_duration_minutes: raw.meeting_duration_minutes,
    booking_advance_weeks: raw.booking_advance_weeks,
  });

  if (parsed.success) return parsed.data;
  return DEFAULT_BOOKING_SETTINGS;
}
