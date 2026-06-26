"use client";

import { useEffect, useRef, useState, type LucideIcon } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientListLoading() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-lp-brand" />
    </div>
  );
}

export function ClientListEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-lp-outline-variant/30 bg-lp-surface-container-low/50 py-16 text-center sm:py-24">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Icon className="h-10 w-10 text-lp-outline-variant" />
      </div>
      <h4 className="font-heading text-lg font-bold text-lp-cta-bg">{title}</h4>
      <p className="mx-auto mt-2 max-w-sm text-sm text-lp-on-surface-variant">{description}</p>
    </div>
  );
}

export function ClientMobileDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-lp-outline-variant/20 bg-white/80 px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-lp-brand" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">
          {label}
        </p>
        <p className="text-sm font-medium text-lp-on-surface">{value}</p>
      </div>
    </div>
  );
}

export function useExpandableRows(itemIds: string[]) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const didAutoExpand = useRef(false);
  const idsKey = itemIds.join(",");

  useEffect(() => {
    if (!didAutoExpand.current && itemIds.length > 0) {
      didAutoExpand.current = true;
      setExpandedIds(new Set([itemIds[0]]));
    }
  }, [idsKey, itemIds]);

  const toggleRow = (id: string, open: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return { expandedIds, toggleRow };
}

export function formatListDate(iso: string, mounted: boolean) {
  if (!mounted) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function mobileRowShell(isOpen: boolean) {
  return cn(
    "overflow-hidden rounded-2xl border transition-shadow duration-200",
    isOpen
      ? "border-lp-brand/25 bg-white shadow-md shadow-lp-brand/5"
      : "border-lp-outline-variant/25 bg-lp-surface-container-lowest/90 shadow-sm"
  );
}

export const clientListTableWrap =
  "hidden overflow-hidden rounded-2xl border border-lp-outline-variant/25 bg-white md:block";

export const clientListTableHead =
  "h-10 px-4 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant";

export const clientListTableRow =
  "border-lp-outline-variant/15 hover:bg-lp-surface-container-low/30";
