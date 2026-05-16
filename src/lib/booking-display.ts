import { format } from "date-fns";

export function formatBookingDateLabel(dateStr: string): string {
  try {
    return format(new Date(`${dateStr}T12:00:00`), "do MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function formatBookingTimeLabel(timeStr: string): string {
  const [hRaw, mRaw] = timeStr.split(":");
  const h = parseInt(hRaw || "0", 10);
  const m = parseInt(mRaw || "0", 10);
  if (Number.isNaN(h)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
