export const BOOKING_ORDER_EXPIRY_MINUTES = Number(
  process.env.BOOKING_ORDER_EXPIRY_MINUTES ?? "10",
);

export type PaymentProviderName = "mock" | "razorpay";

const configuredProvider = process.env.PAYMENT_PROVIDER ?? "mock";

export const PAYMENT_PROVIDER: PaymentProviderName =
  configuredProvider === "razorpay" ? "razorpay" : "mock";

export function getPublicRazorpayKeyId(): string | null {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? null;
}
