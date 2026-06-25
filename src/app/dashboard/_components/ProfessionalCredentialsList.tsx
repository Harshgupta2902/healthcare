"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CalendarIcon,
  ChevronDown,
  Edit,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  Trash2,
  X,
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
  reuploadingId?: string | null;
  onDelete: (id: string) => void;
  onReupload: (id: string, file: File) => void;
  onAddClick: () => void;
};

export function ProfessionalCredentialsList({
  qualifications,
  isLoading,
  reuploadingId = null,
  onDelete,
  onReupload,
  onAddClick,
}: ProfessionalCredentialsListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const didAutoExpand = useRef(false);
  const reuploadInputRef = useRef<HTMLInputElement>(null);
  const pendingReuploadIdRef = useRef<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<{ url: string; title: string } | null>(null);

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

  const triggerReupload = (id: string) => {
    pendingReuploadIdRef.current = id;
    reuploadInputRef.current?.click();
  };

  const openDocumentPreview = (qual: ProfessionalQualification) => {
    if (!qual.documentUrl) return;
    setDocumentPreview({
      url: qual.documentUrl,
      title: getDocumentFileName(qual.documentUrl),
    });
  };

  const handleReuploadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const qualificationId = pendingReuploadIdRef.current;
    event.target.value = "";
    pendingReuploadIdRef.current = null;
    if (!file || !qualificationId) return;
    onReupload(qualificationId, file);
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
      <input
        ref={reuploadInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleReuploadFileChange}
      />

      <div className="hidden overflow-hidden rounded-2xl border border-lp-outline-variant/25 bg-white md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className="h-10 w-[26%] px-4 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Degree / Certification
              </TableHead>
              <TableHead className="h-10 w-[22%] px-4 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Institution
              </TableHead>
              <TableHead className="h-10 w-[8%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Year
              </TableHead>
              <TableHead className="h-10 w-[12%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Status
              </TableHead>
              <TableHead className="h-10 w-[22%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Document
              </TableHead>
              <TableHead className="h-10 w-[10%] px-2 text-right text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qualifications.map((qual) => (
              <CredentialTableRow
                key={qual.id}
                qual={qual}
                isReuploading={reuploadingId === qual.id}
                onDelete={onDelete}
                onReupload={triggerReupload}
                onViewDocument={openDocumentPreview}
              />
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
                      <RowActions
                        qual={qual}
                        isReuploading={reuploadingId === qual.id}
                        onDelete={onDelete}
                        onReupload={triggerReupload}
                        onViewDocument={openDocumentPreview}
                        className="justify-start"
                      />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <DocumentPreviewViewport
        open={documentPreview != null}
        onClose={() => setDocumentPreview(null)}
        url={documentPreview?.url ?? ""}
        title={documentPreview?.title ?? "Document"}
      />
    </div>
  );
}

function CredentialTableRow({
  qual,
  isReuploading,
  onDelete,
  onReupload,
  onViewDocument,
}: {
  qual: ProfessionalQualification;
  isReuploading: boolean;
  onDelete: (id: string) => void;
  onReupload: (id: string) => void;
  onViewDocument: (qual: ProfessionalQualification) => void;
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
        <RowActions
          qual={qual}
          isReuploading={isReuploading}
          onDelete={onDelete}
          onReupload={onReupload}
          onViewDocument={onViewDocument}
        />
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

function hasDocumentUrl(qual: ProfessionalQualification) {
  return Boolean(qual.documentUrl);
}

function canReuploadDocument(qual: ProfessionalQualification) {
  return qual.hasVerificationDocument;
}

function RowActions({
  qual,
  isReuploading,
  onDelete,
  onReupload,
  onViewDocument,
  className,
}: {
  qual: ProfessionalQualification;
  isReuploading: boolean;
  onDelete: (id: string) => void;
  onReupload: (id: string) => void;
  onViewDocument: (qual: ProfessionalQualification) => void;
  className?: string;
}) {
  const viewable = hasDocumentUrl(qual);
  const reuploadable = canReuploadDocument(qual);

  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {reuploadable ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 cursor-pointer rounded-lg text-lp-on-surface-variant hover:bg-lp-brand/10 hover:text-lp-brand"
          onClick={() => onReupload(qual.id)}
          disabled={isReuploading}
          aria-label={`Re-upload document for ${qual.degree}`}
        >
          {isReuploading ? <Loader2 className="size-4 animate-spin" /> : <Edit className="size-4" />}
        </Button>
      ) : null}
      {viewable ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 cursor-pointer rounded-lg text-lp-brand hover:bg-lp-brand/10"
          onClick={() => onViewDocument(qual)}
          aria-label={`View ${getDocumentFileName(qual.documentUrl!)}`}
        >
          <Eye className="size-4" />
        </Button>
      ) : null}

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8 cursor-pointer rounded-lg text-lp-on-surface-variant hover:bg-red-50 hover:text-red-600"
        onClick={() => onDelete(qual.id)}
        disabled={isReuploading}
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

function getDocumentStatusMessage(qual: ProfessionalQualification) {
  if (!qual.hasVerificationDocument) return null;
  if (qual.documentApproved === false) {
    return "Verification failed — upload a new document when re-adding.";
  }
  if (qual.documentApproved == null) {
    return "Document submitted — awaiting admin review.";
  }
  return null;
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

  if (qual.documentApproved === true && qual.documentUrl) {
    const fileName = getDocumentFileName(qual.documentUrl);

    if (variant === "mobile") {
      return (
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-lp-outline-variant/20 bg-white px-3 py-2.5">
          <FileText className="size-4 shrink-0 text-lp-brand/70" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">Document</p>
            <p className="truncate text-sm text-lp-on-surface" title={fileName}>
              {fileName}
            </p>
          </div>
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

  const statusMessage = getDocumentStatusMessage(qual);
  if (!statusMessage) {
    return <span className="text-sm text-lp-outline-variant">—</span>;
  }

  if (variant === "mobile") {
    return (
      <div className="flex gap-2 text-sm">
        <FileText className="mt-0.5 size-4 shrink-0 text-lp-brand/70" aria-hidden />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">Document</p>
          <p className="leading-relaxed text-lp-on-surface-variant">{statusMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex max-w-full items-start gap-1.5 text-xs leading-relaxed text-lp-on-surface-variant">
      <FileText className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span className="line-clamp-2">{statusMessage}</span>
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

function previewKind(url: string): "pdf" | "image" | "other" {
  const path = url.split("?")[0].toLowerCase();
  if (path.endsWith(".pdf")) return "pdf";
  if (/\.(webp|jpe?g|png|gif)$/i.test(path)) return "image";
  return "other";
}

function DocumentPreviewViewport({
  open,
  onClose,
  url,
  title,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
}) {
  const [mounted, setMounted] = useState(false);
  const kind = url ? previewKind(url) : "other";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open || !url) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-lp-surface">
      <header className="flex shrink-0 items-center gap-3 border-b border-lp-outline-variant/25 bg-lp-surface-container-lowest px-4 py-3 sm:px-6">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-9 shrink-0 cursor-pointer rounded-lg"
          onClick={onClose}
          aria-label="Close document preview"
        >
          <X className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-bold text-lp-cta-bg sm:text-lg">{title}</p>
          <p className="text-xs text-lp-on-surface-variant">Credential verification document</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 bg-black/5">
        {kind === "pdf" ? (
          <iframe title={title} src={url} className="h-full w-full border-0 bg-white" />
        ) : null}
        {kind === "image" ? (
          <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
            <img src={url} alt={title} className="max-h-full max-w-full object-contain" />
          </div>
        ) : null}
        {kind === "other" ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-sm text-lp-on-surface-variant">
              Preview is not available for this file type.
            </p>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer rounded-xl"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            >
              Open file
            </Button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
