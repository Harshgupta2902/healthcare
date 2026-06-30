import "server-only";

import crypto from "crypto";
import Razorpay from "razorpay";

const MIN_AMOUNT_PAISE = 100;

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) throw new Error("RAZORPAY_KEY_ID is not configured.");
  return keyId;
}

function getRazorpayKeySecret(): string {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  return keySecret;
}

export function getRazorpayClient(): Razorpay {
  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret(),
  });
}

export function assertPayableAmountPaise(amountPaise: number): void {
  if (amountPaise < MIN_AMOUNT_PAISE) {
    throw new Error(`Payment amount must be at least ₹${(MIN_AMOUNT_PAISE / 100).toFixed(2)}.`);
  }
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  currency: string;
  receipt: string;
}) {
  assertPayableAmountPaise(input.amountPaise);

  const client = getRazorpayClient();
  try {
    const order = await client.orders.create({
      amount: input.amountPaise,
      currency: input.currency,
      receipt: input.receipt,
    });

    return {
      orderId: order.id,
      amount: order.amount as number,
      currency: order.currency as string,
    };
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;

    if (statusCode === 401) {
      throw new Error("Razorpay authentication failed. Check your API keys.");
    }

    throw new Error("Could not create Razorpay order. Please try again.");
  }
}

export function verifyRazorpayPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = getRazorpayKeySecret();
  const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === input.razorpaySignature;
}
