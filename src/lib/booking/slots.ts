import {
  formatIstSlotLabel,
  formatMinutesAsTime,
  istSlotStartToUtc,
  parseTimeToMinutes,
  utcToIstDateYmd,
  utcToIstTimeHm,
} from "./timezone";

export const BOOKING_SLOT_INTERVAL_MINUTES = 60;

export type AvailabilityWindow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type OccupiedSlot = {
  slotStartAt: string;
  status: "held" | "confirmed";
  expiresAt?: string | null;
};

export type BookableSlot = {
  slotStartAt: string;
  slotEndAt: string;
  timeValue: string;
  label: string;
  state: "available" | "booked" | "held_by_other" | "past";
};

function isActiveHold(row: OccupiedSlot, nowMs: number): boolean {
  if (row.status !== "held") return true;
  if (!row.expiresAt) return false;
  return new Date(row.expiresAt).getTime() > nowMs;
}

export function generateHourlySlotsForWindow(
  dateYmd: string,
  windowStartTime: string,
  windowEndTime: string,
  now: Date = new Date(),
  bufferMinutes = 0,
): Omit<BookableSlot, "state">[] {
  const startMins = parseTimeToMinutes(windowStartTime);
  const endMins = parseTimeToMinutes(windowEndTime);
  const slots: Omit<BookableSlot, "state">[] = [];

  for (
    let cursor = startMins;
    cursor + BOOKING_SLOT_INTERVAL_MINUTES <= endMins;
    cursor += BOOKING_SLOT_INTERVAL_MINUTES
  ) {
    const timeValue = formatMinutesAsTime(cursor);
    const slotStartAt = istSlotStartToUtc(dateYmd, timeValue).toISOString();
    const slotEndAt = new Date(
      istSlotStartToUtc(dateYmd, timeValue).getTime() + BOOKING_SLOT_INTERVAL_MINUTES * 60 * 1000,
    ).toISOString();

    const startMs = new Date(slotStartAt).getTime();
    if (startMs < now.getTime() + bufferMinutes * 60 * 1000) continue;

    slots.push({
      slotStartAt,
      slotEndAt,
      timeValue,
      label: formatIstSlotLabel(new Date(slotStartAt), new Date(slotEndAt)),
    });
  }

  return slots;
}

export function buildBookableSlots(params: {
  dateYmd: string;
  availability: AvailabilityWindow[];
  occupied: OccupiedSlot[];
  now?: Date;
  myHoldSlotStartAt?: string | null;
}): BookableSlot[] {
  const now = params.now ?? new Date();
  const nowMs = now.getTime();
  const dayOfWeek = new Date(`${params.dateYmd}T12:00:00+05:30`).getUTCDay();
  const window = params.availability.find((a) => a.dayOfWeek === dayOfWeek && a.isAvailable);

  if (!window) return [];

  const baseSlots = generateHourlySlotsForWindow(
    params.dateYmd,
    window.startTime,
    window.endTime,
    now,
  );

  const occupiedActive = new Set(
    params.occupied
      .filter((o) => isActiveHold(o, nowMs))
      .map((o) => o.slotStartAt),
  );

  return baseSlots.map((slot) => {
    if (params.myHoldSlotStartAt && slot.slotStartAt === params.myHoldSlotStartAt) {
      return { ...slot, state: "available" as const };
    }
    if (occupiedActive.has(slot.slotStartAt)) {
      const occ = params.occupied.find((o) => o.slotStartAt === slot.slotStartAt);
      if (occ?.status === "held" && isActiveHold(occ, nowMs)) {
        return { ...slot, state: "held_by_other" as const };
      }
      return { ...slot, state: "booked" as const };
    }
    return { ...slot, state: "available" as const };
  });
}

export function slotStartToAppointmentFields(slotStartAt: string): {
  date: string;
  time: string;
} {
  const start = new Date(slotStartAt);
  const date = utcToIstDateYmd(start);
  const time = utcToIstTimeHm(start);
  return { date, time };
}

export function meetingEndTimeFromStart(timeHm: string, durationMinutes: number): string {
  const total = parseTimeToMinutes(timeHm) + durationMinutes;
  return formatMinutesAsTime(total);
}
