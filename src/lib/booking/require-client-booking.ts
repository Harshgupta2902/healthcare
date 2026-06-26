import { createClient } from "@/lib/supabase/server";

export const BOOKING_CLIENT_ONLY_MESSAGE =
  "Consultations can only be booked with a patient account. Please sign in as a patient, or register a new patient account.";

export type BookingUserRole = "client" | "professional" | "admin" | string;

export async function getUserBookingRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<BookingUserRole> {
  const { data, error } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.role as BookingUserRole | undefined) ?? "client";
}

export async function assertClientCanBook(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; role: BookingUserRole }> {
  const role = await getUserBookingRole(supabase, userId);
  if (role !== "client") {
    return { ok: false, error: BOOKING_CLIENT_ONLY_MESSAGE, role };
  }
  return { ok: true };
}

export async function requireClientForBooking() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "You must be signed in." };
  }

  const roleCheck = await assertClientCanBook(supabase, user.id);
  if (!roleCheck.ok) {
    return { ok: false as const, error: roleCheck.error, role: roleCheck.role };
  }

  return { ok: true as const, supabase, user, role: "client" as const };
}
