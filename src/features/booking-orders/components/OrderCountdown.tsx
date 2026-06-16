"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

export function OrderCountdown({
  expiresAt,
  onExpired,
}: {
  expiresAt: string;
  onExpired?: () => void;
}) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now()),
  );

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemainingMs(next);
      if (next <= 0) onExpired?.();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpired]);

  const expired = remainingMs <= 0;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        expired
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      <Clock className="h-4 w-4 shrink-0" aria-hidden />
      <span className="font-medium">
        {expired
          ? "This order has expired. Please book again."
          : `Complete payment within ${formatRemaining(remainingMs)}`}
      </span>
    </div>
  );
}
