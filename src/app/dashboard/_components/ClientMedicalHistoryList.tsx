"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, CalendarIcon, ChevronDown, FileText, Stethoscope, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export type ClientMedicalHistoryRecord = {
  id: string;
  conditionName: string;
  diagnosisDate: string | null;
  status: string;
  notes: string | null;
};

type ClientMedicalHistoryListProps = {
  records: ClientMedicalHistoryRecord[];
  isLoading: boolean;
  mounted: boolean;
  onDelete: (id: string) => void;
};

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
        isActive ? "bg-red-100 text-red-700" : "bg-lp-surface-container-low text-lp-on-surface-variant"
      )}
    >
      {status}
    </Badge>
  );
}

export function ClientMedicalHistoryList({
  records,
  isLoading,
  mounted,
  onDelete,
}: ClientMedicalHistoryListProps) {
  const { expandedIds, toggleRow } = useExpandableRows(records.map((r) => r.id));

  if (isLoading) return <ClientListLoading />;

  if (records.length === 0) {
    return (
      <ClientListEmpty
        icon={Activity}
        title="No conditions reported"
        description="Keep your longitudinal health record updated for better care."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className={clientListTableWrap}>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className={cn(clientListTableHead, "w-[28%]")}>Condition</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[14%] px-3")}>Status</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[18%] px-3")}>Diagnosed</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[32%] px-3")}>Notes</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[8%] px-3 text-right")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className={clientListTableRow}>
                <TableCell className="align-middle px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <Stethoscope className="size-4" aria-hidden />
                    </div>
                    <span className="font-heading text-sm font-bold text-lp-on-surface">
                      {record.conditionName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="align-middle px-3 py-3">
                  <StatusBadge status={record.status} />
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {record.diagnosisDate ? formatListDate(record.diagnosisDate, mounted) : "—"}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  <span className="line-clamp-2">{record.notes || "—"}</span>
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-lg text-lp-on-surface-variant hover:bg-red-50 hover:text-red-600"
                    onClick={() => onDelete(record.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Stethoscope className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-base font-bold text-lp-cta-bg">{record.conditionName}</p>
                  <StatusBadge status={record.status} />
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
                      {record.diagnosisDate ? (
                        <ClientMobileDetail
                          icon={CalendarIcon}
                          label="Diagnosed"
                          value={formatListDate(record.diagnosisDate, mounted)}
                        />
                      ) : null}
                      {record.notes ? (
                        <ClientMobileDetail icon={FileText} label="Notes" value={record.notes} />
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl border-red-100 text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(record.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Remove
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
