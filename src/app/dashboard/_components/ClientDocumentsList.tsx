"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, ChevronDown, ExternalLink, FileText, HardDrive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ClientListEmpty,
  ClientListLoading,
  ClientMobileDetail,
  clientListTableHead,
  clientListTableRow,
  clientListTableWrap,
  formatListDate,
  mobileRowShell,
  useExpandableRows,
} from "./client-list-shared";

export type ClientDocumentRecord = {
  id: string;
  documentName: string;
  documentType: string;
  fileUrl: string;
  fileSize: number | null;
  uploadDate: string;
};

type ClientDocumentsListProps = {
  records: ClientDocumentRecord[];
  isLoading: boolean;
  mounted: boolean;
  onDelete: (id: string) => void;
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDocType(type: string) {
  const labels: Record<string, string> = {
    report: "Lab Report",
    prescription: "Prescription",
    imaging: "Imaging",
    other: "Other",
  };
  return labels[type] ?? type;
}

export function ClientDocumentsList({
  records,
  isLoading,
  mounted,
  onDelete,
}: ClientDocumentsListProps) {
  const { expandedIds, toggleRow } = useExpandableRows(records.map((r) => r.id));

  if (isLoading) return <ClientListLoading />;

  if (records.length === 0) {
    return (
      <ClientListEmpty
        icon={FileText}
        title="Your document vault is empty"
        description="Upload lab reports, prescriptions, and imaging files securely."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className={clientListTableWrap}>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className={cn(clientListTableHead, "w-[30%]")}>Document</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[16%] px-3")}>Type</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[12%] px-3")}>Size</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[16%] px-3")}>Uploaded</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[18%] px-3 text-right")}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className={clientListTableRow}>
                <TableCell className="align-middle px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-lp-brand">
                      <FileText className="size-4" aria-hidden />
                    </div>
                    <span className="line-clamp-2 font-heading text-sm font-bold text-lp-on-surface">
                      {record.documentName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm capitalize text-lp-on-surface-variant">
                  {formatDocType(record.documentType)}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm tabular-nums text-lp-on-surface-variant">
                  {formatFileSize(record.fileSize)}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {formatListDate(record.uploadDate, mounted)}
                </TableCell>
                <TableCell className="align-middle px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg border-lp-outline-variant/30 text-xs font-semibold text-lp-brand"
                      onClick={() => window.open(record.fileUrl, "_blank")}
                    >
                      <ExternalLink className="mr-1 size-3.5" />
                      View
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 rounded-lg text-lp-on-surface-variant hover:bg-red-50 hover:text-red-600"
                      onClick={() => onDelete(record.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {records.map((record) => {
          const isOpen = expandedIds.has(record.id);
          return (
            <div key={record.id} className={mobileRowShell(isOpen)}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleRow(record.id, !isOpen)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lp-brand">
                  <FileText className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="line-clamp-2 font-heading text-base font-bold text-lp-cta-bg">
                    {record.documentName}
                  </p>
                  <p className="text-sm capitalize text-lp-on-surface-variant">
                    {formatDocType(record.documentType)}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-lp-on-surface-variant transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 border-t border-lp-outline-variant/15 px-4 pb-4 pt-3">
                      <ClientMobileDetail
                        icon={HardDrive}
                        label="File size"
                        value={formatFileSize(record.fileSize)}
                      />
                      <ClientMobileDetail
                        icon={CalendarIcon}
                        label="Uploaded"
                        value={formatListDate(record.uploadDate, mounted)}
                      />
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl border-lp-outline-variant/30 text-lp-brand"
                          onClick={() => window.open(record.fileUrl, "_blank")}
                        >
                          <ExternalLink className="mr-2 size-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-red-100 text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(record.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
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
