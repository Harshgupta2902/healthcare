import type { ZodError } from "zod";

/** Use with `{ success: true } | { success: false; error: string }` so clients always get a real message in production. */
export type ActionResult<T = void> =
  T extends void
    ? { success: true } | { success: false; error: string }
    : { success: true; data: T } | { success: false; error: string };

export function zodFirstError(error: ZodError): string {
  return error.issues[0]?.message ?? "Validation failed.";
}

export function errorMessage(e: unknown, fallback = "Something went wrong."): string {
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}
