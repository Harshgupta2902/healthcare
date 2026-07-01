import type { NextRequest } from "next/server";
import { requireApiBookingAuth } from "@/lib/api/booking-auth";
import { mapBookingActionResult } from "@/lib/api/map-booking-result";
import { confirmFreeBookingOrder } from "@/features/booking-orders/actions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const authResult = await requireApiBookingAuth(request);
  if (!authResult.ok) return authResult.response;

  const { orderId } = await params;
  const result = await confirmFreeBookingOrder(
    { orderId },
    { auth: authResult.auth },
  );
  return mapBookingActionResult(result);
}
