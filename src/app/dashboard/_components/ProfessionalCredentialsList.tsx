"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CalendarIcon,
  ChevronDown,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type ProfessionalQualification = {
  id: string;
  degree: string;
  institution: string;
  year: number | null;
  hasVerificationDocument: boolean;
  documentUrl: string | null;
  documentApproved?: boolean | null;
};

type ProfessionalCredentialsListProps = {
  qualifications: ProfessionalQualification[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onAddClick: () => void;
};

export function ProfessionalCredentialsList({
  qualifications,
  isLoading,
  onDelete,
  onAddClick,
}: ProfessionalCredentialsListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const didAutoExpand = useRef(false);

  useEffect(() => {
    if (!didAutoExpand.current && qualifications.length > 0) {
      didAutoExpand.current = true;
      setExpandedIds(new Set([qualifications[0].id]));
    }
  }, [qualifications]);

  const toggleRow = (id: string, open: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-lp-brand" />
      </div>
    );
  }

  if (qualifications.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-lp-outline-variant/30 bg-lp-surface-container-low/50 py-16 text-center sm:py-24">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
          <GraduationCap className="h-10 w-10 text-lp-outline-variant" />
        </div>
        <h4 className="font-heading text-lg font-bold text-lp-cta-bg">No credentials listed</h4>
        <p className="mx-auto mt-2 max-w-sm text-sm text-lp-on-surface-variant">
          Add your degrees and certifications so clients can see your professional background.
        </p>
        <Button
          type="button"
          onClick={onAddClick}
          className="mt-6 rounded-xl bg-gradient-to-r from-lp-brand to-lp-brand-bright font-semibold text-lp-on-brand hover:opacity-95"
        >
          Add your first credential
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-2xl border border-lp-outline-variant/25 bg-white md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className="h-10 w-[28%] px-4 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Degree / Certification
              </TableHead>
              <TableHead className="h-10 w-[24%] px-4 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Institution
              </TableHead>
              <TableHead className="h-10 w-[8%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Year
              </TableHead>
              <TableHead className="h-10 w-[12%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Status
              </TableHead>
              <TableHead className="h-10 w-[24%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Document
              </TableHead>
              <TableHead className="h-10 w-[10%] px-2 text-right text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qualifications.map((qual) => (
              <CredentialTableRow key={qual.id} qual={qual} onDelete={onDelete} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {qualifications.map((qual) => {
          const isOpen = expandedIds.has(qual.id);
          return (
            <div
              key={qual.id}
              className={cn(
                "overflow-hidden rounded-2xl border transition-shadow duration-200",
                isOpen
                  ? "border-lp-brand/25 bg-white shadow-md shadow-lp-brand/5"
                  : "border-lp-outline-variant/25 bg-lp-surface-container-lowest/90 shadow-sm"
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleRow(qual.id, !isOpen)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lp-brand/15 to-lp-brand-bright/20 text-lp-brand">
                  <GraduationCap className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-base font-bold leading-snug text-lp-cta-bg">
                    {qual.degree}
                  </p>
                  <p className="truncate text-sm text-lp-on-surface-variant">{qual.institution}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {qual.year != null ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-lp-outline-variant/40 bg-lp-surface-container-low px-2 py-0 text-[10px] font-semibold uppercase text-lp-on-surface-variant"
                      >
                        {qual.year}
                      </Badge>
                    ) : null}
                    <VerificationBadge qual={qual} />
                  </div>
                </div>
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                    isOpen
                      ? "border-lp-brand/30 bg-lp-brand/10 text-lp-brand"
                      : "border-lp-outline-variant/30 bg-white text-lp-on-surface-variant"
                  )}
                >
                  <ChevronDown
                    className={cn("size-5 transition-transform duration-200", isOpen && "rotate-180")}
                    aria-hidden
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 border-t border-lp-outline-variant/20 bg-lp-surface-container-low/40 px-4 py-4">
                      <MobileDetail icon={Building2} label="Institution" value={qual.institution} />
                      {qual.year != null ? (
                        <MobileDetail icon={CalendarIcon} label="Year awarded" value={String(qual.year)} />
                      ) : null}
                      <DocumentCell qual={qual} variant="mobile" />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full rounded-xl border-red-200 font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(qual.id)}
                      >
                        <Trash2 className="mr-1.5 size-4" />
                        Remove credential
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CredentialTableRow({
  qual,
  onDelete,
}: {
  qual: ProfessionalQualification;
  onDelete: (id: string) => void;
}) {
  return (
    <TableRow className="border-lp-outline-variant/15 hover:bg-lp-surface-container-low/30">
      <TableCell className="align-middle px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-lp-brand/10 text-lp-brand">
            <GraduationCap className="size-4" aria-hidden />
          </div>
          <span className="font-heading text-sm font-bold leading-snug text-lp-on-surface">{qual.degree}</span>
        </div>
      </TableCell>
      <TableCell className="align-middle whitespace-normal px-4 py-3 text-sm text-lp-on-surface-variant">
        <span className="line-clamp-2">{qual.institution}</span>
      </TableCell>
      <TableCell className="align-middle px-3 py-3 text-sm font-medium tabular-nums text-lp-on-surface">
        {qual.year ?? "—"}
      </TableCell>
      <TableCell className="align-middle px-3 py-3">
        <VerificationBadge qual={qual} />
      </TableCell>
      <TableCell className="align-middle px-3 py-3">
        <DocumentCell qual={qual} />
      </TableCell>
      <TableCell className="align-middle px-2 py-3 text-right">
        <RowActions qual={qual} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}

function getDocumentFileName(url: string): string {
  try {
    const segment = new URL(url).pathname.split("/").filter(Boolean).pop();
    return decodeURIComponent(segment || "document");
  } catch {
    const segment = url.split("/").pop()?.split("?")[0];
    return decodeURIComponent(segment || "document");
  }
}

function canViewDocument(qual: ProfessionalQualification) {
  return qual.documentApproved === true && Boolean(qual.documentUrl);
}

function RowActions({
  qual,
  onDelete,
  className,
}: {
  qual: ProfessionalQualification;
  onDelete: (id: string) => void;
  className?: string;
}) {
  const viewable = canViewDocument(qual);

  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {viewable ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 rounded-lg text-lp-brand hover:bg-lp-brand/10"
          onClick={() => window.open(qual.documentUrl!, "_blank", "noopener,noreferrer")}
          aria-label={`View ${getDocumentFileName(qual.documentUrl!)}`}
        >
          <Eye className="size-4" />
        </Button>
      ) : null}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8 rounded-lg text-lp-on-surface-variant hover:bg-red-50 hover:text-red-600"
        onClick={() => onDelete(qual.id)}
        aria-label={`Remove ${qual.degree}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function VerificationBadge({ qual }: { qual: ProfessionalQualification }) {
  if (!qual.hasVerificationDocument) {
    return (
      <Badge
        variant="outline"
        className="whitespace-nowrap rounded-full border-lp-outline-variant/40 bg-lp-surface-container-low px-2.5 py-0.5 text-[10px] font-semibold uppercase text-lp-on-surface-variant"
      >
        No document
      </Badge>
    );
  }
  if (qual.documentApproved === true) {
    return (
      <Badge className="whitespace-nowrap rounded-full border-green-200 bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-green-700">
        Verified
      </Badge>
    );
  }
  if (qual.documentApproved === false) {
    return (
      <Badge className="whitespace-nowrap rounded-full border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-red-700">
        Failed
      </Badge>
    );
  }
  return (
    <Badge className="whitespace-nowrap rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
      In review
    </Badge>
  );
}

function DocumentCell({
  qual,
  variant = "table",
}: {
  qual: ProfessionalQualification;
  variant?: "table" | "mobile";
}) {
  if (!qual.hasVerificationDocument) {
    return <span className="text-sm text-lp-outline-variant">—</span>;
  }

  if (canViewDocument(qual) && qual.documentUrl) {
    const fileName = getDocumentFileName(qual.documentUrl);
    if (variant === "mobile") {
      return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-lp-outline-variant/20 bg-white px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="size-4 shrink-0 text-lp-brand/70" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">Document</p>
              <p className="truncate text-sm text-lp-on-surface" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8 shrink-0 rounded-lg border-lp-brand/30 text-lp-brand hover:bg-lp-brand/5"
            onClick={() => window.open(qual.documentUrl!, "_blank", "noopener,noreferrer")}
            aria-label={`View ${fileName}`}
          >
            <Eye className="size-4" />
          </Button>
        </div>
      );
    }

    return (
      <span
        className="inline-flex max-w-full items-center gap-1.5 text-sm text-lp-on-surface"
        title={fileName}
      >
        <FileText className="size-3.5 shrink-0 text-lp-brand/70" aria-hidden />
        <span className="truncate">{fileName}</span>
      </span>
    );
  }

  const message =
    qual.documentApproved === false
      ? "Re-upload required"
      : "Awaiting admin review";

  const fullMessage =
    qual.documentApproved === false
      ? "Verification failed — upload a new document when re-adding."
      : "Document submitted — awaiting admin review.";

  if (variant === "mobile") {
    return (
      <div className="flex gap-2 text-sm">
        <FileText className="mt-0.5 size-4 shrink-0 text-lp-brand/70" aria-hidden />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">Document</p>
          <p className="text-lp-on-surface-variant">{fullMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-lp-on-surface-variant"
      title={fullMessage}
    >
      <FileText className="size-3.5 shrink-0" aria-hidden />
      {message}
    </span>
  );
}

function MobileDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-lp-brand/70" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">{label}</p>
        <p className="leading-relaxed text-lp-on-surface">{value}</p>
      </div>
    </div>
  );
}
