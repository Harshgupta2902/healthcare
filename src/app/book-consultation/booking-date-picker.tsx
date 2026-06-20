"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getBookableDates } from "@/features/booking-slots/actions";
import { ymdToCalendarDate } from "@/lib/booking/bookable-dates";

const lpBookingTriggerClass =
  "flex w-full items-center justify-between gap-2 rounded-lg border border-lp-outline-variant/50 bg-lp-surface-container-low py-3 px-4 font-sans text-base leading-6 text-lp-on-surface outline-none transition-all focus:border-lp-brand focus:ring-2 focus:ring-lp-brand/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type BookingDatePickerProps = {
  professionalId: string | null;
  value: string;
  onChange: (date: string) => void;
  error?: string;
  disabled?: boolean;
};

function formatBookableDateLabel(ymd: string): string {
  return format(ymdToCalendarDate(ymd), "EEEE, d MMMM, yyyy");
}

export function BookingDatePicker({
  professionalId,
  value,
  onChange,
  error,
  disabled,
}: BookingDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [bookableDates, setBookableDates] = useState<string[]>([]);
  const [availableDayLabels, setAvailableDayLabels] = useState("");
  const [advanceWeeks, setAdvanceWeeks] = useState(2);
  const [hasAvailability, setHasAvailability] = useState(true);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const loadDates = useCallback(async (professionalId: string) => {
    setInitialLoading(true);
    try {
      const result = await getBookableDates({ professionalId });
      if ("error" in result && result.error) {
        setBookableDates([]);
        return;
      }
      if ("success" in result && result.success) {
        setBookableDates(result.dates);
        setAvailableDayLabels(result.availableDayLabels);
        setAdvanceWeeks(result.advanceWeeks);
        setHasAvailability(result.hasAvailability);
      }
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!professionalId) {
      setBookableDates([]);
      setAvailableDayLabels("");
      setHasAvailability(true);
      return;
    }
    void loadDates(professionalId);
  }, [professionalId, loadDates]);

  useEffect(() => {
    if (value && bookableDates.length > 0 && !bookableDates.includes(value)) {
      onChangeRef.current("");
    }
  }, [bookableDates, value]);

  const pickerDisabled =
    disabled ||
    !professionalId ||
    initialLoading ||
    !hasAvailability ||
    bookableDates.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <label
        id="booking-date-label"
        className="font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant"
      >
        Preferred Date
      </label>

      {!professionalId ? (
        <p className="font-sans text-sm text-lp-on-surface-variant">
          Select a consultant to see available dates.
        </p>
      ) : initialLoading && bookableDates.length === 0 ? (
        <Skeleton className="h-12 w-full rounded-lg bg-lp-surface-container-high" />
      ) : (
        <>
          {hasAvailability && availableDayLabels ? (
            <p className="font-sans text-xs text-lp-on-surface-variant">
              Available on {availableDayLabels} · book up to {advanceWeeks} week
              {advanceWeeks > 1 ? "s" : ""} ahead
            </p>
          ) : null}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                id="booking-date"
                aria-labelledby="booking-date-label"
                aria-expanded={open}
                disabled={pickerDisabled}
                className={cn(
                  lpBookingTriggerClass,
                  error && "border-red-500",
                )}
              >
                <span className="min-w-0 truncate text-left">
                  {value ? (
                    <>
                      Selected:{" "}
                      <span className="font-heading font-bold text-lp-brand">
                        {formatBookableDateLabel(value)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lp-on-surface-variant">Select a date</span>
                  )}
                </span>
                <ChevronDown className="size-4 shrink-0 text-lp-on-surface-variant" aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[var(--radix-popover-trigger-width)] rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-1 shadow-xl"
            >
              <ul className="max-h-60 overflow-y-auto" role="listbox">
                {bookableDates.map((ymd) => {
                  const isSelected = value === ymd;
                  return (
                    <li key={ymd} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(ymd);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left font-sans text-sm transition-colors",
                          isSelected
                            ? "bg-lp-brand/10 font-medium text-lp-brand"
                            : "text-lp-on-surface hover:bg-lp-surface-container-low",
                        )}
                      >
                        <span className="truncate">{formatBookableDateLabel(ymd)}</span>
                        {isSelected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </PopoverContent>
          </Popover>

          {!hasAvailability ? (
            <p className="font-sans text-xs text-amber-700">
              This consultant has not set weekly availability yet.
            </p>
          ) : null}

          {hasAvailability && bookableDates.length === 0 ? (
            <p className="font-sans text-xs text-lp-on-surface-variant">
              No bookable dates in the next {advanceWeeks} week{advanceWeeks > 1 ? "s" : ""}.
            </p>
          ) : null}
        </>
      )}

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
