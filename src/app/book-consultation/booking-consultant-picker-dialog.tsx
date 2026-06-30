"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { searchProfessionals } from "@/features/professional/actions";
import { cn } from "@/lib/utils";
import { ArrowRight, IndianRupee, MapPin, ShieldCheck } from "lucide-react";

type ConsultantListItem = Extract<
  Awaited<ReturnType<typeof searchProfessionals>>,
  { success: true }
>["data"][number];

function formatSessionFee(fee?: number | null) {
  return `₹${((fee || 0) / 100).toLocaleString("en-IN")}`;
}

function ConsultantPickerRow({
  consultant,
  onSelect,
}: {
  consultant: ConsultantListItem;
  onSelect: (consultantId: string) => void;
}) {
  const displayName = consultant.displayName ?? consultant.name;

  const handleSelect = () => {
    onSelect(consultant.id);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
      aria-label={`Select ${displayName} for booking`}
      className="flex cursor-pointer gap-4 rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-4 text-left transition-colors hover:border-lp-brand/40 hover:bg-lp-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-brand/30"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-lp-surface-container">
        {consultant.profilePhotoUrl ? (
          <Image
            src={consultant.profilePhotoUrl}
            alt={displayName}
            fill
            sizes="64px"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lp-surface-container-high to-lp-surface-container">
            <span className="font-heading text-lg font-bold text-lp-brand/50">
              {displayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-base font-semibold text-lp-on-surface">{displayName}</h3>
          {consultant.isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-lp-surface-container-high px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-lp-brand">
              <ShieldCheck className="size-3 shrink-0" aria-hidden />
              Verified
            </span>
          ) : null}
        </div>
        <p className="mb-2 font-sans text-sm font-medium text-lp-brand">{consultant.specialization}</p>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-lp-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0 text-lp-brand" aria-hidden />
            {consultant.city || "Online"}
          </span>
          <span className="inline-flex items-center gap-0.5 font-semibold text-lp-on-surface">
            <IndianRupee className="size-3.5 shrink-0" aria-hidden />
            {formatSessionFee(consultant.consultationFee)} / session
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="h-9 cursor-pointer rounded-lg bg-lp-brand-bright px-4 font-sans text-xs font-semibold text-lp-on-brand hover:bg-lp-brand-bright/90"
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
          >
            Select
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-lp-outline-variant/40 font-sans text-xs font-semibold"
            asChild
          >
            <Link
              href={`/consultants/${consultant.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              View more
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function ConsultantPickerSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-lp-outline-variant/30 p-4">
      <Skeleton className="size-16 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function BookingConsultantPickerDialog({
  open,
  onOpenChange,
  onSelect,
  required = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (consultantId: string) => void;
  /** When true, the dialog cannot be dismissed until a specialist is selected. */
  required?: boolean;
}) {
  const [consultants, setConsultants] = useState<ConsultantListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    searchProfessionals()
      .then((res) => {
        if (cancelled) return;
        if (!res.success) {
          setError(res.error || "Could not load consultants.");
          setConsultants([]);
          return;
        }
        setConsultants(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load consultants.");
          setConsultants([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSelect = (consultantId: string) => {
    onSelect(consultantId);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (required && !nextOpen) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!required}
        onPointerDownOutside={required ? (event) => event.preventDefault() : undefined}
        onInteractOutside={required ? (event) => event.preventDefault() : undefined}
        onEscapeKeyDown={required ? (event) => event.preventDefault() : undefined}
        className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl"
      >
        <DialogHeader className="space-y-1 border-b border-lp-outline-variant/20 px-6 py-5 text-left">
          <DialogTitle className="font-heading text-2xl font-bold text-lp-on-surface">
            Choose a specialist
          </DialogTitle>
          <DialogDescription className="font-sans text-sm text-lp-on-surface-variant">
            Select a consultant to continue with your booking, or view their full profile first.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <ConsultantPickerSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-6 text-center font-sans text-sm text-red-600">
              {error}
            </p>
          ) : consultants.length === 0 ? (
            <p className="rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-high px-4 py-6 text-center font-sans text-sm text-lp-on-surface-variant">
              No verified consultants are available right now.
            </p>
          ) : (
            <div className="space-y-3">
              {consultants.map((consultant) => (
                <ConsultantPickerRow key={consultant.id} consultant={consultant} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-lp-outline-variant/20 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 w-full rounded-xl border-lp-outline-variant/40 font-sans text-sm font-semibold",
            )}
            asChild
          >
            <Link href="/consultants">
              Browse all consultants
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
