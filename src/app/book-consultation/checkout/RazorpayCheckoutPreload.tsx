"use client";

import { useEffect, useState } from "react";
import { ensureRazorpayCheckoutReady } from "@/features/booking-orders/lib/razorpay-checkout";

export function RazorpayCheckoutPreload({
  enabled,
  onReadyChange,
  showStatus = true,
}: {
  enabled: boolean;
  onReadyChange?: (ready: boolean) => void;
  showStatus?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      onReadyChange?.(false);
      return;
    }

    let cancelled = false;
    setStatus("loading");

    void ensureRazorpayCheckoutReady().then((result) => {
      if (cancelled) return;
      const ready = result.ok;
      setStatus(ready ? "ready" : "error");
      onReadyChange?.(ready);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, onReadyChange]);

  if (!enabled || !showStatus || status === "ready") return null;

  return (
    <p className="text-center text-xs text-lp-on-surface-variant">
      {status === "loading" ? "Loading secure payment…" : "Payment gateway could not load. Refresh the page."}
    </p>
  );
}
