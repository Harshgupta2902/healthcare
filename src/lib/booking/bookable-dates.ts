import { utcToIstDateYmd } from "./timezone";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function getIstDayOfWeekFromYmd(dateYmd: string): number {
  return new Date(`${dateYmd}T12:00:00+05:30`).getUTCDay();
}

export function addDaysToYmd(dateYmd: string, days: number): string {
  const base = new Date(`${dateYmd}T12:00:00+05:30`);
  base.setUTCDate(base.getUTCDate() + days);
  return utcToIstDateYmd(base);
}

export function ymdToCalendarDate(dateYmd: string): Date {
  const [y, m, d] = dateYmd.split("-").map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d);
}

export function calendarDateToYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatBookableDayLabels(daysOfWeek: number[]): string {
  const unique = Array.from(new Set(daysOfWeek)).sort((a, b) => a - b);
  return unique.map((d) => DAY_LABELS[d] ?? "?").join(", ");
}

export function listBookableDates(
  availableDaysOfWeek: number[],
  advanceWeeks: number,
  now: Date = new Date(),
): string[] {
  const weeks = Math.min(3, Math.max(1, advanceWeeks));
  const todayYmd = utcToIstDateYmd(now);
  const lastYmd = addDaysToYmd(todayYmd, weeks * 7);
  const daySet = new Set(availableDaysOfWeek);
  const dates: string[] = [];

  let cursor = todayYmd;
  while (cursor <= lastYmd) {
    if (daySet.has(getIstDayOfWeekFromYmd(cursor))) {
      dates.push(cursor);
    }
    cursor = addDaysToYmd(cursor, 1);
  }

  return dates;
}

export function isYmdBookable(
  dateYmd: string,
  availableDaysOfWeek: number[],
  advanceWeeks: number,
  now: Date = new Date(),
): boolean {
  return listBookableDates(availableDaysOfWeek, advanceWeeks, now).includes(dateYmd);
}
