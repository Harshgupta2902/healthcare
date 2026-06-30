"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  ChevronDown,
  CreditCard,
  Shield,
  Trash2,
  User,
} from "lucide-react";
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

export type ClientInsuranceRecord = {
  id: string;
  providerName: string;
  policyNumber: string;
  policyHolderName: string;
  expirationDate: string | null;
};

type ClientInsuranceListProps = {
  records: ClientInsuranceRecord[];
  isLoading: boolean;
  mounted: boolean;
  onDelete: (id: string) => void;
};

export function ClientInsuranceList({
  records,
  isLoading,
  mounted,
  onDelete,
}: ClientInsuranceListProps) {
  const { expandedIds, toggleRow } = useExpandableRows(records.map((r) => r.id));

  if (isLoading) return <ClientListLoading />;

  if (records.length === 0) {
    return (
      <ClientListEmpty
        icon={Shield}
        title="No insurance policies linked"
        description="Link your provider for direct billing and coverage verification."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className={clientListTableWrap}>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className={cn(clientListTableHead, "w-[24%]")}>Provider</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[20%] px-3")}>Policy ID</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[22%] px-3")}>Beneficiary</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[16%] px-3")}>Expires</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[10%] px-3")}>Status</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[8%] px-3 text-right")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className={clientListTableRow}>
                <TableCell className="align-middle px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Shield className="size-4" aria-hidden />
                    </div>
                    <span className="font-heading text-sm font-bold text-lp-on-surface">
                      {record.providerName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="align-middle px-3 py-3 font-mono text-sm text-lp-on-surface-variant">
                  {record.policyNumber}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {record.policyHolderName}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {record.expirationDate
                    ? formatListDate(record.expirationDate, mounted)
                    : "Lifetime"}
                </TableCell>
                <TableCell className="align-middle px-3 py-3">
                  <Badge className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
                    Active
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Shield className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-base font-bold text-lp-cta-bg">{record.providerName}</p>
                  <p className="font-mono text-sm text-lp-on-surface-variant">{record.policyNumber}</p>
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
                        label="Beneficiary"
                        value={record.policyHolderName}
                      />
                      <ClientMobileDetail
                        icon={CreditCard}
                        label="Policy ID"
                        value={record.policyNumber}
                      />
                      <ClientMobileDetail
                        icon={CalendarIcon}
                        label="Expiration"
                        value={
                          record.expirationDate
                            ? formatListDate(record.expirationDate, mounted)
                            : "Lifetime"
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl border-red-100 text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(record.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Disconnect
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
