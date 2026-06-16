import type { BookingOrderRow } from "../../types";
import type { PaymentCaptureResult, PaymentProvider } from "./types";

export const mockPaymentProvider: PaymentProvider = {
  name: "mock",

  async captureMockPayment(
    order: BookingOrderRow,
    outcome: "success" | "declined",
  ): Promise<PaymentCaptureResult> {
    if (outcome === "declined") {
      return { ok: false, reason: "declined", message: "Payment was declined." };
    }

    const suffix = order.id.replace(/-/g, "").slice(0, 12);
    return { ok: true, transactionId: `mock_${suffix}_${Date.now()}` };
  },
};
