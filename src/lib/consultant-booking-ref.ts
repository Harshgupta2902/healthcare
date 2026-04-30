import { z } from "zod";

const uuidSchema = z.string().uuid();

/** URL-safe base64 (RFC 4648 §5) of UTF-8 bytes — safe in query strings without extra encoding issues. */
export function encodeConsultantIdRef(id: string): string {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return "";
  const b64 = btoa(parsed.data);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeConsultantIdRef(ref: string | null | undefined): string | null {
  if (!ref?.trim()) return null;
  try {
    const padded = ref.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (padded.length % 4)) % 4;
    const b64 = padded + "=".repeat(padLen);
    const id = atob(b64);
    const parsed = uuidSchema.safeParse(id);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function buildBookConsultationHref(consultantUserId: string): string {
  const token = encodeConsultantIdRef(consultantUserId);
  if (!token) return "/book-consultation";
  return `/book-consultation?cref=${encodeURIComponent(token)}`;
}
