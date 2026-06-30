/** Same-origin path only — blocks open redirects (e.g. ?redirect=https://evil.com). */
export function safeInternalRedirect(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.includes("://") || raw.includes("\\")) return null;
  return raw;
}
