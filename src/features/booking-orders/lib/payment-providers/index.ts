import { PAYMENT_PROVIDER } from "../constants";
import { mockPaymentProvider } from "./mock";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  if (PAYMENT_PROVIDER === "mock") return mockPaymentProvider;
  return mockPaymentProvider;
}
