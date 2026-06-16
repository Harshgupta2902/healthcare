import type { BookingOrderRow } from "../../types";

export type PaymentCaptureResult =
  | { ok: true; transactionId: string }
  | { ok: false; reason: "declined" | "error"; message?: string };

export interface PaymentProvider {
  readonly name: string;
  captureMockPayment(order: BookingOrderRow, outcome: "success" | "declined"): Promise<PaymentCaptureResult>;
}
