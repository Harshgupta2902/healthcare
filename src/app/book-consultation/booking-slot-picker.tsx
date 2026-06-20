"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAvailableSlots,
  getMyActiveHold,
  reserveSlot,
  releaseSlot,
  type BookableSlot,
} from "@/features/booking-slots";
import type { BookingSettings } from "@/lib/booking-settings";

type SlotHold = {
  holdId: string;
  expiresAt: string;
  slotStartAt: string;
  date: string;
  time: string;
};

type BookingSlotPickerProps = {
  professionalId: string | null;
  date: string;
  disabled?: boolean;
  onHoldChange: (hold: SlotHold | null) => void;
  onTimeChange: (time: string) => void;
};

function formatCountdown(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SlotSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-lp-outline-variant/20 bg-lp-surface-container-lowest px-4 py-3"
        >
          <Skeleton className="h-4 w-32 rounded-md bg-lp-surface-container-high" />
          <Skeleton className="mt-2 h-3 w-20 rounded-md bg-lp-surface-container-high" />
        </div>
      ))}
    </div>
  );
}

export function BookingSlotPicker({
  professionalId,
  date,
  disabled,
  onHoldChange,
  onTimeChange,
}: BookingSlotPickerProps) {
  const [slots, setSlots] = useState<BookableSlot[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [activeHold, setActiveHold] = useState<SlotHold | null>(null);
  const [fetching, setFetching] = useState(false);
  const [reserving, setReserving] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [, startTransition] = useTransition();
  const fetchSeq = useRef(0);

  const syncHold = useCallback(
    (hold: SlotHold | null) => {
      setActiveHold(hold);
      onHoldChange(hold);
      onTimeChange(hold?.time ?? "");
    },
    [onHoldChange, onTimeChange],
  );

  const loadSlots = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!professionalId || !date) {
        setSlots([]);
        setFetching(false);
        return;
      }

      const seq = ++fetchSeq.current;
      if (!opts?.silent) setFetching(true);

      try {
        const result = await getAvailableSlots({ professionalId, date });
        if (seq !== fetchSeq.current) return;

        if ("error" in result && result.error) {
          toast.error(result.error);
          setSlots([]);
          return;
        }
        if ("success" in result && result.success) {
          setSlots(result.slots);
          setSettings(result.settings);
        }
      } finally {
        if (seq === fetchSeq.current && !opts?.silent) {
          setFetching(false);
        }
      }
    },
    [professionalId, date],
  );

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    if (!activeHold || !date || activeHold.date === date) return;
    void releaseSlot({ holdId: activeHold.holdId }).finally(() => {
      syncHold(null);
    });
  }, [date, activeHold, syncHold]);

  useEffect(() => {
    if (!professionalId) {
      syncHold(null);
      return;
    }
    let cancelled = false;
    void getMyActiveHold({ professionalId }).then((result) => {
      if (cancelled) return;
      if ("success" in result && result.success && result.hold) {
        syncHold({
          holdId: result.hold.holdId,
          expiresAt: result.hold.expiresAt,
          slotStartAt: result.hold.slotStartAt,
          date: result.hold.date,
          time: result.hold.time,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [professionalId, syncHold]);

  useEffect(() => {
    if (!activeHold) {
      setCountdown("");
      return;
    }
    const tick = () => {
      const label = formatCountdown(activeHold.expiresAt);
      setCountdown(label);
      if (new Date(activeHold.expiresAt).getTime() <= Date.now()) {
        toast.error("Your slot hold expired. Please select a slot again.");
        syncHold(null);
        void loadSlots({ silent: true });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeHold, loadSlots, syncHold]);

  const handleSelectSlot = (slot: BookableSlot) => {
    if (!professionalId || disabled || slot.state !== "available") return;
    if (activeHold?.slotStartAt === slot.slotStartAt) return;

    startTransition(async () => {
      setReserving(slot.slotStartAt);
      try {
        if (activeHold) {
          await releaseSlot({ holdId: activeHold.holdId });
        }
        const result = await reserveSlot({
          professionalId,
          slotStartAt: slot.slotStartAt,
        });
        if ("error" in result && result.error) {
          toast.error(result.error);
          await loadSlots({ silent: true });
          return;
        }
        if ("success" in result && result.success) {
          syncHold({
            holdId: result.holdId,
            expiresAt: result.expiresAt,
            slotStartAt: result.slotStartAt,
            date: result.date,
            time: result.time,
          });
          toast.success("Slot reserved", {
            description: "Complete your booking before the timer runs out.",
          });
          await loadSlots({ silent: true });
        }
      } finally {
        setReserving(null);
      }
    });
  };

  if (!professionalId) {
    return (
      <p className="font-sans text-sm text-lp-on-surface-variant">
        Select a consultant to view available hourly slots.
      </p>
    );
  }

  if (!date) {
    return (
      <p className="font-sans text-sm text-lp-on-surface-variant">
        Choose a date to see available slots.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {settings ? (
        <p className="font-sans text-xs text-lp-on-surface-variant">
          Hourly booking slots · Consultation length up to {settings.meeting_duration_minutes}{" "}
          minutes
        </p>
      ) : null}

      {activeHold ? (
        <div className="flex items-center gap-2 rounded-lg border border-lp-brand/30 bg-lp-brand/5 px-4 py-3">
          <Clock className="size-4 shrink-0 text-lp-brand" aria-hidden />
          <span className="font-sans text-sm font-medium text-lp-on-surface">
            Complete booking in{" "}
            <span className="font-heading tabular-nums text-lp-brand">{countdown}</span>
          </span>
        </div>
      ) : null}

      {fetching ? (
        <SlotSkeletonGrid />
      ) : slots.length === 0 ? (
        <p className="rounded-lg border border-lp-outline-variant/30 bg-lp-surface-container-low px-4 py-6 text-center font-sans text-sm text-lp-on-surface-variant">
          No hourly slots available for this date. Try another day.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => {
            const isSelected = activeHold?.slotStartAt === slot.slotStartAt;
            const isBusy = reserving === slot.slotStartAt;
            const unavailable = slot.state !== "available" && !isSelected;

            return (
              <button
                key={slot.slotStartAt}
                type="button"
                disabled={disabled || unavailable || isBusy}
                onClick={() => handleSelectSlot(slot)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-all",
                  isSelected
                    ? "border-lp-brand bg-lp-brand/10 ring-2 ring-lp-brand/20"
                    : unavailable
                      ? "cursor-not-allowed border-lp-outline-variant/20 bg-lp-surface-container-low opacity-60"
                      : "border-lp-outline-variant/30 bg-lp-surface-container-lowest hover:border-lp-brand/40 hover:bg-lp-surface-container-low",
                  isBusy && "opacity-70",
                )}
              >
                <p className="font-heading text-sm font-semibold text-lp-on-surface">{slot.label}</p>
                <p className="mt-1 font-sans text-xs text-lp-on-surface-variant">
                  {isBusy
                    ? "Reserving…"
                    : isSelected
                      ? "Your reserved slot"
                      : slot.state === "booked"
                        ? "Booked"
                        : slot.state === "held_by_other"
                          ? "Someone is booking"
                          : "Available"}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
