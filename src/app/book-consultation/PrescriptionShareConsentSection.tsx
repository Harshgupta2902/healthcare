"use client";

import { useMemo } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatBookingDateLabel, formatBookingTimeLabel } from "@/lib/booking-display";
import { MAX_SHARED_PRESCRIPTIONS, type EligiblePrescriptionItem } from "@/features/prescription-sharing/types";

type PrescriptionShareConsentSectionProps = {
  prescriptions: EligiblePrescriptionItem[];
  isLoading: boolean;
  consentEnabled: boolean;
  onConsentChange: (enabled: boolean) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  error?: string | null;
};

export function PrescriptionShareConsentSection({
  prescriptions,
  isLoading,
  consentEnabled,
  onConsentChange,
  selectedIds,
  onSelectedIdsChange,
  error,
}: PrescriptionShareConsentSectionProps) {
  const maxSelectable = Math.min(prescriptions.length, MAX_SHARED_PRESCRIPTIONS);
  const atSelectionLimit = selectedIds.length >= maxSelectable;

  const selectionHint = useMemo(() => {
    if (!consentEnabled) return null;
    if (selectedIds.length === 0) {
      return "Select which prescriptions to share with your consultant.";
    }
    return `${selectedIds.length} of ${maxSelectable} selected`;
  }, [consentEnabled, selectedIds.length, maxSelectable]);

  if (isLoading) {
    return (
      <section className="booking-shadow rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-6 sm:p-8">
        <div className="flex items-center gap-3 text-lp-on-surface-variant">
          <Loader2 className="size-5 animate-spin text-lp-brand" aria-hidden />
          <span className="font-sans text-sm">Checking for prior prescriptions…</span>
        </div>
      </section>
    );
  }

  if (prescriptions.length === 0) {
    return null;
  }

  const toggleSelection = (id: string, checked: boolean) => {
    if (checked) {
      if (selectedIds.includes(id) || atSelectionLimit) return;
      onSelectedIdsChange([...selectedIds, id]);
      return;
    }
    onSelectedIdsChange(selectedIds.filter((itemId) => itemId !== id));
  };

  return (
    <section className="booking-shadow rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="text-lp-brand">
          <FileText className="size-6" aria-hidden />
        </span>
        <h2 className="font-heading text-2xl font-semibold text-lp-on-surface">Share prior prescriptions</h2>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-lp-outline-variant/25 bg-lp-surface-container-low/50 p-4">
        <Checkbox
          checked={consentEnabled}
          onCheckedChange={(checked) => {
            const enabled = checked === true;
            onConsentChange(enabled);
            if (!enabled) onSelectedIdsChange([]);
          }}
          className="mt-0.5"
          aria-describedby="prescription-share-consent-desc"
        />
        <span className="space-y-1">
          <span className="block font-sans text-sm font-semibold text-lp-on-surface">
            I consent to share selected prior prescriptions with my consultant
          </span>
          <span id="prescription-share-consent-desc" className="block font-sans text-sm text-lp-on-surface-variant">
            Only your {MAX_SHARED_PRESCRIPTIONS} most recent prescriptions are shown. Select which ones to share
            with this consultation (up to {MAX_SHARED_PRESCRIPTIONS}).
          </span>
        </span>
      </label>

      {consentEnabled ? (
        <div className="mt-4 space-y-2">
          {selectionHint ? (
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-lp-on-surface-variant">
              {selectionHint}
            </p>
          ) : null}

          <ul className="space-y-2">
            {prescriptions.map((item) => {
              const checked = selectedIds.includes(item.id);
              const disabled = !checked && atSelectionLimit;

              return (
                <li key={item.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                      checked
                        ? "border-lp-brand/40 bg-lp-brand/5"
                        : "border-lp-outline-variant/25 bg-lp-surface-container-low/40",
                      disabled && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(next) => toggleSelection(item.id, next === true)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-sans text-sm font-semibold text-lp-on-surface">
                        {item.category}
                      </span>
                      <span className="block font-sans text-sm text-lp-on-surface-variant">
                        {formatBookingDateLabel(item.appointmentDate)} ·{" "}
                        {formatBookingTimeLabel(item.appointmentTime)}
                        {item.professionalName ? ` · ${item.professionalName}` : ""}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}
    </section>
  );
}
