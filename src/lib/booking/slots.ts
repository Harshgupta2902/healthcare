import {
  formatIstSlotLabel,
  formatMinutesAsTime,
  istSlotStartToUtc,
  normalizeAvailabilityTime,
  parseTimeToMinutes,
  utcToIstDateYmd,
  utcToIstTimeHm,
} from "./timezone";

export const BOOKING_SLOT_INTERVAL_MINUTES = 60;

/** Compare slot instants regardless of ISO formatting (+00:00 vs Z, ms precision). */
export function slotInstantMs(iso: string): number {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return NaN;
  return ms;
}

export function slotInstantsEqual(a: string, b: string): boolean {
  const aMs = slotInstantMs(a);
  const bMs = slotInstantMs(b);
  return !Number.isNaN(aMs) && aMs === bMs;
}

/** True when a slot row matches a hold using instant or IST date+time fields. */
export function slotMatchesHold(
  slot: Pick<BookableSlot, "slotStartAt" | "timeValue">,
  hold: { slotStartAt: string; date: string; time: string } | null | undefined,
  slotDate: string,
): boolean {
  if (!hold) return false;
  if (hold.date === slotDate && hold.time === slot.timeValue) return true;
  return slotInstantsEqual(slot.slotStartAt, hold.slotStartAt);
}

/** True when at least one full hourly slot fits between start and end (24h wall clock). */
export function isValidHourlyAvailabilityWindow(startTime: string, endTime: string): boolean {
  const start = parseTimeToMinutes(normalizeAvailabilityTime(startTime));
  const end = parseTimeToMinutes(normalizeAvailabilityTime(endTime));
  return start + BOOKING_SLOT_INTERVAL_MINUTES <= end;
}

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

export type SlotGenerationDebug = {
  dateYmd: string;
  dayOfWeek: number;
  nowIso: string;
  availabilityRows: AvailabilityWindow[];
  matchedWindow: AvailabilityWindow | null;
  normalizedStart: string | null;
  normalizedEnd: string | null;
  startMinutes: number | null;
  endMinutes: number | null;
  rawSlotCount: number;
  futureSlotCount: number;
  emptyReason:
    | null
    | "no_availability_window"
    | "invalid_time_window"
    | "all_slots_past"
    | "occupied_only";
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
  includePast = false,
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
    if (!includePast && startMs < now.getTime() + bufferMinutes * 60 * 1000) continue;

    slots.push({
      slotStartAt,
      slotEndAt,
      timeValue,
      label: formatIstSlotLabel(new Date(slotStartAt), new Date(slotEndAt)),
    });
  }

  return slots;
}

export function diagnoseSlotGeneration(params: {
  dateYmd: string;
  availability: AvailabilityWindow[];
  now?: Date;
}): SlotGenerationDebug {
  const now = params.now ?? new Date();
  const dayOfWeek = new Date(`${params.dateYmd}T12:00:00+05:30`).getUTCDay();
  const normalizedAvailability = params.availability.map((row) => ({
    ...row,
    dayOfWeek: Number(row.dayOfWeek),
    startTime: normalizeAvailabilityTime(row.startTime),
    endTime: normalizeAvailabilityTime(row.endTime),
    isAvailable: Boolean(row.isAvailable),
  }));

  const matchedWindow =
    normalizedAvailability.find((a) => a.dayOfWeek === dayOfWeek && a.isAvailable) ?? null;

  if (!matchedWindow) {
    return {
      dateYmd: params.dateYmd,
      dayOfWeek,
      nowIso: now.toISOString(),
      availabilityRows: normalizedAvailability,
      matchedWindow: null,
      normalizedStart: null,
      normalizedEnd: null,
      startMinutes: null,
      endMinutes: null,
      rawSlotCount: 0,
      futureSlotCount: 0,
      emptyReason: "no_availability_window",
    };
  }

  const startMinutes = parseTimeToMinutes(matchedWindow.startTime);
  const endMinutes = parseTimeToMinutes(matchedWindow.endTime);
  const rawSlots = generateHourlySlotsForWindow(
    params.dateYmd,
    matchedWindow.startTime,
    matchedWindow.endTime,
    now,
    0,
    true,
  );
  const futureSlots = generateHourlySlotsForWindow(
    params.dateYmd,
    matchedWindow.startTime,
    matchedWindow.endTime,
    now,
  );

  let emptyReason: SlotGenerationDebug["emptyReason"] = null;
  if (startMinutes + BOOKING_SLOT_INTERVAL_MINUTES > endMinutes) {
    emptyReason = "invalid_time_window";
  } else if (rawSlots.length > 0 && futureSlots.length === 0) {
    emptyReason = "all_slots_past";
  } else if (rawSlots.length === 0) {
    emptyReason = "invalid_time_window";
  }

  return {
    dateYmd: params.dateYmd,
    dayOfWeek,
    nowIso: now.toISOString(),
    availabilityRows: normalizedAvailability,
    matchedWindow,
    normalizedStart: matchedWindow.startTime,
    normalizedEnd: matchedWindow.endTime,
    startMinutes,
    endMinutes,
    rawSlotCount: rawSlots.length,
    futureSlotCount: futureSlots.length,
    emptyReason,
  };
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
  const normalizedAvailability = params.availability.map((row) => ({
    ...row,
    dayOfWeek: Number(row.dayOfWeek),
    startTime: normalizeAvailabilityTime(row.startTime),
    endTime: normalizeAvailabilityTime(row.endTime),
    isAvailable: Boolean(row.isAvailable),
  }));
  const window = normalizedAvailability.find(
    (a) => a.dayOfWeek === dayOfWeek && a.isAvailable,
  );

  if (!window) return [];

  const baseSlots = generateHourlySlotsForWindow(
    params.dateYmd,
    window.startTime,
    window.endTime,
    now,
  );

  const occupiedActive = params.occupied.filter((o) => isActiveHold(o, nowMs));

  return baseSlots.map((slot) => {
    if (
      params.myHoldSlotStartAt &&
      slotInstantsEqual(slot.slotStartAt, params.myHoldSlotStartAt)
    ) {
      return { ...slot, state: "available" as const };
    }
    const occ = occupiedActive.find((o) => slotInstantsEqual(o.slotStartAt, slot.slotStartAt));
    if (occ) {
      if (occ.status === "held" && isActiveHold(occ, nowMs)) {
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
