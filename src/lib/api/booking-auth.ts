import type { NextRequest } from "next/server";
import { createApiSupabase, getApiUser } from "@/lib/api/auth";
import { apiError } from "@/lib/api/response";
import { assertClientCanBook } from "@/lib/booking/require-client-booking";
import type { BookingActionAuth } from "@/lib/booking/action-auth";

export async function requireApiBookingAuth(
  request: NextRequest,
): Promise<
  | { ok: true; auth: BookingActionAuth }
  | { ok: false; response: ReturnType<typeof apiError> }
> {
  const supabase = createApiSupabase(request);
  const user = await getApiUser(supabase);
  if (!user) {
    return { ok: false, response: apiError("Unauthorized", 401, "unauthorized") };
  }

  const roleCheck = await assertClientCanBook(supabase, user.id);
  if (!roleCheck.ok) {
    return {
      ok: false,
      response: apiError(roleCheck.error, 403, "wrong_role"),
    };
  }

  return { ok: true, auth: { supabase, user } };
}
