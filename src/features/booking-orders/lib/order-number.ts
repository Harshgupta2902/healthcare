/** Human-readable order number: HH-YYYYMMDD-XXXXXX */
export function generateOrderNumber(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HH-${y}${m}${d}-${rand}`;
}
