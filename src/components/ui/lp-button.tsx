"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const lpButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 font-sans font-semibold outline-none transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-lp-brand/30 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "rounded-lg bg-gradient-to-r from-lp-brand to-lp-brand-bright px-4 py-4 text-lp-on-brand shadow-lg hover:shadow-xl active:scale-[0.98] uppercase tracking-wide text-sm",
        primaryLg:
          "gap-3 rounded-xl bg-gradient-to-r from-lp-brand to-lp-brand-bright px-4 py-4 font-heading text-xl font-semibold leading-8 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 md:text-2xl md:leading-10",
        secondary:
          "rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container px-4 py-3 text-lp-on-surface hover:bg-lp-surface-container-high",
        outline:
          "rounded-xl border-2 border-lp-brand bg-transparent px-8 py-3 text-lp-brand uppercase tracking-wide text-sm hover:bg-lp-surface-container-low active:scale-95",
        outlineSoft:
          "rounded-lg border border-lp-outline-variant bg-transparent px-4 py-3 text-lp-on-surface hover:bg-lp-surface-container-low",
        ghost:
          "rounded-md bg-transparent p-1 text-lp-outline-variant hover:bg-lp-surface/40 hover:text-lp-on-surface",
        segmentOn:
          "flex-1 rounded-lg bg-white py-3 px-4 text-sm font-semibold uppercase tracking-wide text-lp-brand shadow-sm",
        segmentOff:
          "flex-1 rounded-lg py-3 px-4 text-sm font-semibold uppercase tracking-wide text-lp-on-surface-variant transition-colors hover:text-lp-brand",
        headerGuest:
          "rounded-lg border border-lp-outline-variant bg-transparent px-4 py-2.5 text-sm font-semibold tracking-wide text-lp-on-surface transition-all duration-200 hover:bg-lp-surface-container active:scale-95 sm:px-6",
        headerGuestCta:
          "rounded-lg bg-gradient-to-r from-lp-brand to-lp-brand-bright px-4 py-2.5 text-sm font-semibold tracking-wide text-lp-on-brand shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 sm:px-6",
        pillOn:
          "rounded-full bg-lp-brand px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-lp-on-brand shadow-md whitespace-nowrap",
        pillOff:
          "rounded-full border border-lp-outline-variant bg-lp-surface-container-lowest px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant whitespace-nowrap transition-all hover:border-lp-brand hover:text-lp-brand",
        directoryFab:
          "pointer-events-none flex size-12 shrink-0 items-center justify-center rounded-full bg-lp-brand text-lp-on-brand shadow-lg transition-transform group-hover:scale-110",
        paginationIcon:
          "flex size-10 shrink-0 items-center justify-center rounded-full border border-lp-outline-variant text-lp-on-surface-variant transition-colors hover:bg-lp-surface-container disabled:opacity-50",
      },
      size: {
        default: "",
        compact: "py-3 px-4",
        sm: "py-2 px-3 text-xs",
        icon: "min-h-0 min-w-0 p-1",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  },
);

export type LpButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof lpButtonVariants> & {
    asChild?: boolean;
  };

const LpButton = React.forwardRef<HTMLButtonElement, LpButtonProps>(function LpButton(
  { className, variant, size, fullWidth, asChild = false, type = "button", ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      data-slot="lp-button"
      type={asChild ? undefined : type}
      className={cn(lpButtonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
});

LpButton.displayName = "LpButton";

export { LpButton, lpButtonVariants };
