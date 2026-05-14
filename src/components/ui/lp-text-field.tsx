"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type LpTextFieldSurface = "white" | "muted";

export interface LpTextFieldProps extends Omit<React.ComponentProps<"input">, "className"> {
  label?: React.ReactNode;
  /** Shown on the same row as the label (e.g. “Forgot password?”) */
  labelEndSlot?: React.ReactNode;
  /** Merged onto the `<label>` element */
  labelClassName?: string;
  error?: string;
  /** Renders inside a leading slot (e.g. Lucide icon) */
  startIcon?: React.ReactNode;
  /** Renders inside the field row (e.g. password toggle); use `absolute` positioning from caller */
  endSlot?: React.ReactNode;
  /** Extra classes on the `<input>` */
  inputClassName?: string;
  surface?: LpTextFieldSurface;
  /** Login fields use `lg`; register uses `xl` */
  rounding?: "lg" | "xl";
}

const LpTextField = React.forwardRef<HTMLInputElement, LpTextFieldProps>(function LpTextField(
  {
    id,
    label,
    labelEndSlot,
    labelClassName,
    error,
    startIcon,
    endSlot,
    inputClassName,
    surface = "white",
    rounding = "xl",
    disabled,
    "aria-invalid": ariaInvalid,
    ...inputProps
  },
  ref,
) {
  const surfaceClass = surface === "muted" ? "bg-lp-surface" : "bg-white";
  const roundClass = rounding === "lg" ? "rounded-lg" : "rounded-xl";

  const labelClass = cn(
    "font-sans text-xs font-semibold uppercase tracking-wide",
    surface === "muted" ? "text-lp-on-surface" : "px-1 text-lp-on-surface-variant",
    labelClassName,
  );

  return (
    <div className="space-y-2">
      {label != null && labelEndSlot == null && (
        <label htmlFor={id} className={cn("block", labelClass)}>
          {label}
        </label>
      )}
      {label != null && labelEndSlot != null && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className={labelClass}>
            {label}
          </label>
          {labelEndSlot}
        </div>
      )}
      <div className="group relative">
        {startIcon ? (
          <span
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 z-[1] flex -translate-y-1/2 text-lp-outline-variant transition-colors group-focus-within:text-lp-brand",
              disabled && "opacity-50",
            )}
          >
            {startIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={ariaInvalid ?? !!error}
          className={cn(
            "block w-full border border-lp-outline-variant py-3 font-sans text-base leading-6 text-lp-on-surface outline-none transition-all placeholder:text-lp-on-surface-variant/70 focus:border-lp-brand focus:ring-2 focus:ring-lp-brand/20 disabled:opacity-50 md:text-sm",
            roundClass,
            surfaceClass,
            startIcon ? "pl-12 pr-4" : "px-4",
            endSlot ? "pr-12" : null,
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            inputClassName,
          )}
          {...inputProps}
        />
        {endSlot}
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
});

LpTextField.displayName = "LpTextField";

export { LpTextField };
