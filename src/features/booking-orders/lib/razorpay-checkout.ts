"use client";

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailedResponse = {
  error: {
    description?: string;
    reason?: string;
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailedResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

function isRazorpayReady(): boolean {
  return typeof window !== "undefined" && typeof window.Razorpay === "function";
}

function waitForRazorpay(timeoutMs = 20000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isRazorpayReady()) {
      resolve(true);
      return;
    }

    const started = Date.now();
    const check = () => {
      if (isRazorpayReady()) {
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(false);
        return;
      }
      window.setTimeout(check, 50);
    };

    check();
  });
}

/** Layout loads checkout.js — we only wait for window.Razorpay to be ready. */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  return waitForRazorpay();
}

export async function ensureRazorpayCheckoutReady(maxAttempts = 3): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (await loadRazorpayCheckoutScript()) return true;
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  return false;
}

export type OpenRazorpayCheckoutInput = {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpayHandlerResponse) => void;
  onDismiss: () => void;
  onFailure: (message: string) => void;
};

export type OpenRazorpayCheckoutResult =
  | { ok: true }
  | { ok: false; reason: "script" | "init" };

export async function openRazorpayCheckout(
  input: OpenRazorpayCheckoutInput,
): Promise<OpenRazorpayCheckoutResult> {
  const loaded = await ensureRazorpayCheckoutReady();
  if (!loaded || !isRazorpayReady()) {
    return { ok: false, reason: "script" };
  }

  try {
    const rzp = new window.Razorpay!({
      key: input.key,
      amount: input.amount,
      currency: input.currency,
      name: "Healthcare Consultation",
      description: input.orderNumber,
      order_id: input.orderId,
      prefill: {
        name: input.customerName,
        email: input.customerEmail,
        contact: input.customerPhone,
      },
      handler: input.onSuccess,
      modal: {
        ondismiss: input.onDismiss,
      },
    });

    rzp.on("payment.failed", (response) => {
      input.onFailure(response.error.description ?? "Payment failed. Please try again.");
    });

    rzp.open();
    return { ok: true };
  } catch {
    return { ok: false, reason: "init" };
  }
}
