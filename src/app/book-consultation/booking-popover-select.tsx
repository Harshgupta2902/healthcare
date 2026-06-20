"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const lpBookingTriggerClass =
  "flex w-full items-center justify-between gap-2 rounded-lg border border-lp-outline-variant/50 bg-lp-surface-container-low py-3 px-4 font-sans text-base leading-6 text-lp-on-surface outline-none transition-all focus:border-lp-brand focus:ring-2 focus:ring-lp-brand/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type BookingPopoverSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function BookingPopoverSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  disabled,
  className,
}: BookingPopoverSelectProps) {
  const [open, setOpen] = useState(false);
  const labelId = `${id}-label`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        id={labelId}
        htmlFor={id}
        className="font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant"
      >
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            aria-labelledby={labelId}
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              lpBookingTriggerClass,
              error && "border-red-500",
            )}
          >
            <span className="min-w-0 truncate text-left">
              {value ? (
                <span className="text-lp-on-surface">{value}</span>
              ) : (
                <span className="text-lp-on-surface-variant">{placeholder}</span>
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
            {options.map((option) => {
              const isSelected = value === option;
              return (
                <li key={option} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left font-sans text-sm transition-colors",
                      isSelected
                        ? "bg-lp-brand/10 font-medium text-lp-brand"
                        : "text-lp-on-surface hover:bg-lp-surface-container-low",
                    )}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
