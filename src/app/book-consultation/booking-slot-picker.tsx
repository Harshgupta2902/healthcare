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
import type { SlotGenerationDebug } from "@/lib/booking/slots";
import { slotInstantsEqual, slotMatchesHold } from "@/lib/booking/slots";

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

function emptySlotsMessage(
  emptyReason: SlotGenerationDebug["emptyReason"] | "occupied_only" | null | undefined,
): string {
  switch (emptyReason) {
    case "no_availability_window":
      return "This consultant has no working hours set for this day of the week.";
    case "invalid_time_window":
      return "Working hours look invalid (end time must be at least 1 hour after start). Ask the consultant to update availability.";
    case "all_slots_past":
      return "All slots for today have already passed. Please pick a later date.";
    case "occupied_only":
      return "All hourly slots are booked or held for this date. Try another day.";
    default:
      return "No hourly slots available for this date. Try another day.";
  }
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
  const [emptyReason, setEmptyReason] = useState<SlotGenerationDebug["emptyReason"] | "occupied_only" | null>(
    null,
  );
  const [fetching, setFetching] = useState(false);
  const [reserving, setReserving] = useState<string | null>(null);
  const [optimisticSlotStartAt, setOptimisticSlotStartAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [, startTransition] = useTransition();
  const fetchSeq = useRef(0);
  const onHoldChangeRef = useRef(onHoldChange);
  const onTimeChangeRef = useRef(onTimeChange);
  const activeHoldRef = useRef<SlotHold | null>(null);
  onHoldChangeRef.current = onHoldChange;
  onTimeChangeRef.current = onTimeChange;

  const syncHold = useCallback((hold: SlotHold | null) => {
    const prev = activeHoldRef.current;
    if (
      prev?.holdId === hold?.holdId &&
      prev?.expiresAt === hold?.expiresAt &&
      prev?.slotStartAt === hold?.slotStartAt
    ) {
      return;
    }
    activeHoldRef.current = hold;
    setActiveHold(hold);
    setOptimisticSlotStartAt(null);
    onHoldChangeRef.current(hold);
    onTimeChangeRef.current(hold?.time ?? "");
  }, []);

  const loadSlots = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!professionalId || !date) {
        setSlots([]);
        setEmptyReason(null);
        setFetching(false);
        return;
      }

      const seq = ++fetchSeq.current;
      if (!opts?.silent) setFetching(true);

      try {
        const result = await getAvailableSlots({ professionalId, date });
        if (seq !== fetchSeq.current) return;

        if ("error" in result) {
          toast.error(result.error);
          setSlots([]);
          setEmptyReason(null);
          return;
        }

        setSlots(result.slots);
        setSettings(result.settings);
        setEmptyReason(result.emptyReason ?? null);
        if (result.slots.length === 0 || result.emptyReason) {
          console.warn("[BookingSlotPicker] no slots", {
            professionalId,
            date,
            emptyReason: result.emptyReason,
            debug: result.debug,
            slots: result.slots,
          });
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
    const expiresAt = activeHold.expiresAt;
    const tick = () => {
      const label = formatCountdown(expiresAt);
      setCountdown(label);
      if (new Date(expiresAt).getTime() <= Date.now()) {
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
    if (activeHold && slotMatchesHold(slot, activeHold, date)) return;

    setOptimisticSlotStartAt(slot.slotStartAt);
    setReserving(slot.slotStartAt);
    onTimeChangeRef.current(slot.timeValue);

    startTransition(async () => {
      try {
        if (activeHold) {
          await releaseSlot({ holdId: activeHold.holdId });
        }
        const result = await reserveSlot({
          professionalId,
          slotStartAt: slot.slotStartAt,
        });
        if ("error" in result && result.error) {
          setOptimisticSlotStartAt(null);
          onTimeChangeRef.current(activeHold?.time ?? "");
          toast.error(result.error);
          void loadSlots({ silent: true });
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
          void loadSlots({ silent: true });
        }
      } catch {
        setOptimisticSlotStartAt(null);
        onTimeChangeRef.current(activeHold?.time ?? "");
        toast.error("Could not reserve this slot. Please try again.");
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

  const reservedSlotLabel =
    activeHold &&
    (slots.find((s) => slotMatchesHold(s, activeHold, date))?.label ??
      `${activeHold.time} (your slot)`);

  const showSlotGrid =
    slots.length > 0 &&
    (slots.some((s) => s.state === "available") || activeHold || optimisticSlotStartAt);

  return (
    <div className="space-y-4">
      {settings ? (
        <p className="font-sans text-xs text-lp-on-surface-variant">
          Hourly booking slots · Consultation length up to {settings.meeting_duration_minutes}{" "}
          minutes
        </p>
      ) : null}

      {activeHold ? (
        <div className="flex flex-col gap-1 rounded-lg border border-lp-brand/30 bg-lp-brand/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-sm font-medium text-lp-on-surface">
            Reserved:{" "}
            <span className="font-heading text-lp-brand">{reservedSlotLabel}</span>
          </p>
          <p className="flex items-center gap-2 font-sans text-sm font-medium text-lp-on-surface">
            <Clock className="size-4 shrink-0 text-lp-brand" aria-hidden />
            Complete in{" "}
            <span className="font-heading tabular-nums text-lp-brand">{countdown}</span>
          </p>
        </div>
      ) : null}

      {fetching ? (
        <SlotSkeletonGrid />
      ) : !showSlotGrid ? (
        <p className="rounded-lg border border-lp-outline-variant/30 bg-lp-surface-container-low px-4 py-6 text-center font-sans text-sm text-lp-on-surface-variant">
          {emptySlotsMessage(emptyReason)}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => {
            const isSelected =
              slotMatchesHold(slot, activeHold, date) ||
              (optimisticSlotStartAt !== null &&
                slotInstantsEqual(optimisticSlotStartAt, slot.slotStartAt));
            const isBusy =
              reserving !== null && slotInstantsEqual(reserving, slot.slotStartAt);
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
