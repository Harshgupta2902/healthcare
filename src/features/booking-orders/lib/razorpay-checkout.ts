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

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";

function isRazorpayReady(): boolean {
  return typeof window !== "undefined" && typeof window.Razorpay === "function";
}

function isPaymentEmbedBlocked(): boolean {
  return typeof window !== "undefined" && window.crossOriginIsolated === true;
}

function findRazorpayScript(): HTMLScriptElement | null {
  const byId = document.getElementById(RAZORPAY_SCRIPT_ID);
  if (byId instanceof HTMLScriptElement) return byId;
  return document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
}

function waitForRazorpay(timeoutMs = 30000): Promise<boolean> {
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

function injectRazorpayScript(): Promise<boolean> {
  if (isRazorpayReady()) return Promise.resolve(true);

  const existing = findRazorpayScript();
  if (existing) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
        resolve(ok);
      };

      const onLoad = () => {
        existing.dataset.loaded = "true";
        void waitForRazorpay().then(finish);
      };
      const onError = () => {
        existing.dataset.loaded = "error";
        finish(false);
      };

      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);

      if (existing.dataset.loaded === "true") {
        void waitForRazorpay().then(finish);
        return;
      }

      void waitForRazorpay().then(finish);
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;

    const finish = (ok: boolean) => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      if (!ok) script.remove();
      resolve(ok);
    };

    const onLoad = () => {
      script.dataset.loaded = "true";
      void waitForRazorpay().then(finish);
    };
    const onError = () => {
      script.dataset.loaded = "error";
      finish(false);
    };

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    document.head.appendChild(script);
  });
}

export type RazorpayCheckoutLoadFailure =
  | "timeout"
  | "blocked_by_isolation"
  | "network";

/** Prefer layout/next/script; inject checkout.js if it is missing (e.g. build-time env mismatch). */
export async function loadRazorpayCheckoutScript(): Promise<
  true | RazorpayCheckoutLoadFailure
> {
  if (typeof window === "undefined") return "timeout";
  if (isRazorpayReady()) return true;

  if (await waitForRazorpay(5000)) return true;

  const injected = await injectRazorpayScript();
  if (injected) return true;

  if (isPaymentEmbedBlocked()) return "blocked_by_isolation";
  return findRazorpayScript()?.dataset.loaded === "error" ? "network" : "timeout";
}

export type RazorpayCheckoutReadyResult =
  | { ok: true }
  | { ok: false; reason: RazorpayCheckoutLoadFailure };

export async function ensureRazorpayCheckoutReady(
  maxAttempts = 4,
): Promise<RazorpayCheckoutReadyResult> {
  let lastReason: RazorpayCheckoutLoadFailure = "timeout";

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const loaded = await loadRazorpayCheckoutScript();
    if (loaded === true) return { ok: true };
    lastReason = loaded;

    if (lastReason === "blocked_by_isolation") break;

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  return { ok: false, reason: lastReason };
}

export function razorpayCheckoutLoadErrorMessage(
  reason: RazorpayCheckoutLoadFailure,
): string {
  switch (reason) {
    case "blocked_by_isolation":
      return "Payment gateway is blocked by browser security. Refresh this page and try again.";
    case "network":
      return "Could not load Razorpay checkout. Check your connection or disable ad blockers.";
    default:
      return "Could not load Razorpay checkout. Please wait a moment and try again.";
  }
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
  options?: { assumeScriptReady?: boolean },
): Promise<OpenRazorpayCheckoutResult> {
  if (options?.assumeScriptReady) {
    if (!isRazorpayReady()) {
      return { ok: false, reason: "script" };
    }
  } else {
    const ready = await ensureRazorpayCheckoutReady();
    if (!ready.ok || !isRazorpayReady()) {
      return { ok: false, reason: "script" };
    }
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
