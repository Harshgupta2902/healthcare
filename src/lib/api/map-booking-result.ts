import { apiError, apiSuccess } from "@/lib/api/response";

type ActionResult = Record<string, unknown> & { error?: string; code?: string };

export function mapBookingActionResult(result: ActionResult) {
  if ("error" in result && result.error) {
    const code = typeof result.code === "string" ? result.code : undefined;
    const status =
      code === "wrong_role"
        ? 403
        : code === "rate_limit" || code === "ip" || code === "device" || code === "email"
          ? 429
          : 400;
    return apiError(result.error, status, code);
  }
  return apiSuccess(result);
}
