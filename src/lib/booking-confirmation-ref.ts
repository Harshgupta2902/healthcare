import { z } from "zod";

const uuidSchema = z.string().uuid();

/** URL-safe base64 of appointment UUID for `/book-consultation/success?ref=`. */
export function encodeBookingConfirmationRef(appointmentId: string): string {
  const parsed = uuidSchema.safeParse(appointmentId);
  if (!parsed.success) return "";
  const b64 = btoa(parsed.data);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecodeUtf8(ref: string): string {
  const padded = ref.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + "=".repeat(padLen);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  return atob(b64);
}

export function decodeBookingConfirmationRef(ref: string | null | undefined): string | null {
  if (!ref?.trim()) return null;
  try {
    const id = base64UrlDecodeUtf8(ref.trim());
    const parsed = uuidSchema.safeParse(id);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function buildBookingSuccessHref(appointmentId: string): string {
  const token = encodeBookingConfirmationRef(appointmentId);
  if (!token) return "/book-consultation";
  return `/book-consultation/success?ref=${encodeURIComponent(token)}`;
}
