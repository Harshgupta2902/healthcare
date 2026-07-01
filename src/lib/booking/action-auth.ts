import type { SupabaseClient, User } from "@supabase/supabase-js";
import { assertClientCanBook, requireClientForBooking, type BookingUserRole } from "@/lib/booking/require-client-booking";

export type BookingActionAuth = {
  supabase: SupabaseClient;
  user: User;
};

export type ResolvedClientBookingAuth =
  | { ok: true; supabase: SupabaseClient; user: User; role: "client" }
  | { ok: false; error: string; role?: BookingUserRole };

export async function resolveClientBookingAuth(
  auth?: BookingActionAuth,
): Promise<ResolvedClientBookingAuth> {
  if (auth) {
    const roleCheck = await assertClientCanBook(auth.supabase, auth.user.id);
    if (!roleCheck.ok) {
      return { ok: false, error: roleCheck.error, role: roleCheck.role };
    }
    return { ok: true, supabase: auth.supabase, user: auth.user, role: "client" };
  }

  const result = await requireClientForBooking();
  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      ...("role" in result && result.role ? { role: result.role } : {}),
    };
  }
  return {
    ok: true,
    supabase: result.supabase,
    user: result.user,
    role: result.role,
  };
}
