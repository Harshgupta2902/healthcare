import {
  buildBookingSuccessHref,
  decodeBookingConfirmationRef,
  encodeBookingConfirmationRef,
} from "@/lib/booking-confirmation-ref";

export function encodeOrderRef(orderId: string): string {
  return encodeBookingConfirmationRef(orderId);
}

export function decodeOrderRef(ref: string | null | undefined): string | null {
  return decodeBookingConfirmationRef(ref);
}

export function buildCheckoutHref(orderId: string): string {
  const token = encodeOrderRef(orderId);
  if (!token) return "/book-consultation";
  return `/book-consultation/checkout?order=${encodeURIComponent(token)}`;
}

export { buildBookingSuccessHref };
