"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CalendarIcon,
  ChevronDown,
  FileText,
  Loader2,
  MapPin,
  Stethoscope,
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
  mobileRowShell,
  useExpandableRows,
} from "./client-list-shared";

export type ClientAppointmentRecord = {
  id: string;
  professionalName: string | null;
  category: string;
  state: string;
  city: string;
  appointmentDate: string;
  appointmentTime: string;
  message: string | null;
  prescriptionHtml: string | null;
  prescriptionUpdatedAt: string | null;
};

type ClientAppointmentsListProps = {
  records: ClientAppointmentRecord[];
  isLoading: boolean;
  mounted: boolean;
  prescriptionPdfLoadingId: string | null;
  onViewPrescriptionPdf: (record: ClientAppointmentRecord) => void;
};

function formatSchedule(
  date: string,
  time: string,
  mounted: boolean
): string {
  if (!mounted) return "—";
  return new Date(`${date}T${(time || "00:00").slice(0, 5)}:00`).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ClientAppointmentsList({
  records,
  isLoading,
  mounted,
  prescriptionPdfLoadingId,
  onViewPrescriptionPdf,
}: ClientAppointmentsListProps) {
  const { expandedIds, toggleRow } = useExpandableRows(records.map((r) => r.id));

  if (isLoading) return <ClientListLoading />;

  if (records.length === 0) {
    return (
      <ClientListEmpty
        icon={Calendar}
        title="No requests yet"
        description="Your consultation requests will appear here after you book."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className={clientListTableWrap}>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className={cn(clientListTableHead, "w-[22%]")}>Specialist</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[14%] px-3")}>Category</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[16%] px-3")}>Location</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[22%] px-3")}>Schedule</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[12%] px-3")}>Status</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[14%] px-3 text-right")}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className={clientListTableRow}>
                <TableCell className="align-middle px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Stethoscope className="size-4" aria-hidden />
                    </div>
                    <span className="line-clamp-2 font-heading text-sm font-bold text-lp-on-surface">
                      {record.professionalName || "Consultation Team"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-brand">
                  {record.category}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {record.city}, {record.state}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {formatSchedule(record.appointmentDate, record.appointmentTime, mounted)}
                </TableCell>
                <TableCell className="align-middle px-3 py-3">
                  <Badge className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                    Submitted
                  </Badge>
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-right">
                  {record.prescriptionHtml ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg border-emerald-100 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                      disabled={prescriptionPdfLoadingId === record.id}
                      onClick={() => onViewPrescriptionPdf(record)}
                    >
                      {prescriptionPdfLoadingId === record.id ? (
                        <Loader2 className="mr-1 size-3.5 animate-spin" />
                      ) : (
                        <FileText className="mr-1 size-3.5" />
                      )}
                      PDF
                    </Button>
                  ) : (
                    <span className="text-xs text-lp-on-surface-variant">—</span>
                  )}
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Stethoscope className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-base font-bold text-lp-cta-bg">
                    {record.professionalName || "Consultation Team"}
                  </p>
                  <p className="text-sm text-lp-on-surface-variant">
                    {formatSchedule(record.appointmentDate, record.appointmentTime, mounted)}
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
                      <ClientMobileDetail icon={User} label="Category" value={record.category} />
                      <ClientMobileDetail
                        icon={MapPin}
                        label="Location"
                        value={`${record.city}, ${record.state}`}
                      />
                      {record.message ? (
                        <ClientMobileDetail icon={CalendarIcon} label="Message" value={record.message} />
                      ) : null}
                      {record.prescriptionUpdatedAt && mounted ? (
                        <ClientMobileDetail
                          icon={FileText}
                          label="Prescription updated"
                          value={new Date(record.prescriptionUpdatedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        />
                      ) : null}
                      {record.prescriptionHtml ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                          disabled={prescriptionPdfLoadingId === record.id}
                          onClick={() => onViewPrescriptionPdf(record)}
                        >
                          {prescriptionPdfLoadingId === record.id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <FileText className="mr-2 size-4" />
                          )}
                          {prescriptionPdfLoadingId === record.id ? "Preparing PDF…" : "View PDF"}
                        </Button>
                      ) : null}
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
