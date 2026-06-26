"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, ChevronDown, Pill, Stethoscope, Trash2, User } from "lucide-react";
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

export type ClientMedicationRecord = {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  prescribingDoctor: string | null;
  isActive: boolean;
};

type ClientMedicationsListProps = {
  records: ClientMedicationRecord[];
  isLoading: boolean;
  mounted: boolean;
  onDelete: (id: string) => void;
};

export function ClientMedicationsList({
  records,
  isLoading,
  mounted,
  onDelete,
}: ClientMedicationsListProps) {
  const { expandedIds, toggleRow } = useExpandableRows(records.map((r) => r.id));

  if (isLoading) return <ClientListLoading />;

  if (records.length === 0) {
    return (
      <ClientListEmpty
        icon={Pill}
        title="No active prescriptions"
        description="Add medications to receive reminders and safety alerts."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className={clientListTableWrap}>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className={cn(clientListTableHead, "w-[24%]")}>Medication</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[14%] px-3")}>Dosage</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[16%] px-3")}>Frequency</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[18%] px-3")}>Doctor</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[12%] px-3")}>Status</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[8%] px-3 text-right")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className={clientListTableRow}>
                <TableCell className="align-middle px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Pill className="size-4" aria-hidden />
                    </div>
                    <span className="font-heading text-sm font-bold text-lp-on-surface">
                      {record.medicationName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {record.dosage}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {record.frequency}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {record.prescribingDoctor || "Self"}
                </TableCell>
                <TableCell className="align-middle px-3 py-3">
                  <Badge
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
                      record.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-lp-surface-container-low text-lp-on-surface-variant"
                    )}
                  >
                    {record.isActive ? "Active" : "Inactive"}
                  </Badge>
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Pill className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-base font-bold text-lp-cta-bg">{record.medicationName}</p>
                  <p className="text-sm text-lp-on-surface-variant">
                    {record.dosage} · {record.frequency}
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
                        icon={User}
                        label="Prescribing doctor"
                        value={record.prescribingDoctor || "Self"}
                      />
                      <ClientMobileDetail
                        icon={CalendarIcon}
                        label="Start date"
                        value={formatListDate(record.startDate, mounted)}
                      />
                      {record.endDate ? (
                        <ClientMobileDetail
                          icon={Stethoscope}
                          label="End date"
                          value={formatListDate(record.endDate, mounted)}
                        />
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
