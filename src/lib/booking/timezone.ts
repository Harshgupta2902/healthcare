/** Asia/Kolkata wall-clock helpers for hourly booking slots. */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function parseTimeToMinutes(time: string): number {
  const normalized = normalizeAvailabilityTime(time);
  const [hRaw, mRaw = "00"] = normalized.split(":");
  const hours = Math.min(23, Math.max(0, parseInt(hRaw || "0", 10)));
  const minutes = Math.min(59, Math.max(0, parseInt(mRaw.slice(0, 2) || "0", 10)));
  return hours * 60 + minutes;
}

/** Normalize DB / HTML time values to HH:mm (24h). */
export function normalizeAvailabilityTime(time: string): string {
  const trimmed = String(time ?? "").trim();
  if (!trimmed) return "00:00";
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "00:00";
  const hours = Math.min(23, Math.max(0, parseInt(match[1], 10)));
  const minutes = Math.min(59, Math.max(0, parseInt(match[2], 10)));
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatMinutesAsTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Build UTC instant for IST wall date + HH:mm on the hour. */
export function istSlotStartToUtc(dateYmd: string, timeHm: string): Date {
  const [y, mo, d] = dateYmd.split("-").map((v) => parseInt(v, 10));
  const mins = parseTimeToMinutes(timeHm);
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const utcMs = Date.UTC(y, mo - 1, d, hours, minutes) - IST_OFFSET_MS;
  const start = new Date(utcMs);
  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid slot date or time");
  }
  return start;
}

export function utcToIstDateYmd(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function utcToIstTimeHm(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  const h = String(ist.getUTCHours()).padStart(2, "0");
  const m = String(ist.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatIstSlotLabel(startUtc: Date, endUtc: Date): string {
  const fmt = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  return `${fmt.format(startUtc)} – ${fmt.format(endUtc)}`;
}
