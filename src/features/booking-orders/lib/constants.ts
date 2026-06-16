export const BOOKING_ORDER_EXPIRY_MINUTES = Number(
  process.env.BOOKING_ORDER_EXPIRY_MINUTES ?? "10",
);

export const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER ?? "mock") as "mock";
