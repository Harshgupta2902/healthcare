"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, ChevronDown, CreditCard, IndianRupee, Loader2, User } from "lucide-react";
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

export type ProfessionalPaymentRecord = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  createdAt: string;
  clientName?: string;
};

type ProfessionalPaymentsListProps = {
  payments: ProfessionalPaymentRecord[];
  isLoading: boolean;
  mounted: boolean;
};

function formatAmount(amount: number) {
  return `₹${(amount / 100).toFixed(2)}`;
}

function formatDate(iso: string, mounted: boolean) {
  if (!mounted) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PaymentStatusBadge({ status }: { status: string }) {
  const isCompleted = status === "completed";
  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
        isCompleted ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
      )}
    >
      {status}
    </Badge>
  );
}

function MobileDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
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

export function ProfessionalPaymentsList({
  payments,
  isLoading,
  mounted,
}: ProfessionalPaymentsListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const didAutoExpand = useRef(false);

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  useEffect(() => {
    if (!didAutoExpand.current && sortedPayments.length > 0) {
      didAutoExpand.current = true;
      setExpandedIds(new Set([sortedPayments[0].id]));
    }
  }, [sortedPayments]);

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

  if (sortedPayments.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-lp-outline-variant/30 bg-lp-surface-container-low/50 py-16 text-center sm:py-24">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
          <IndianRupee className="h-10 w-10 text-lp-outline-variant" />
        </div>
        <h4 className="font-heading text-lg font-bold text-lp-cta-bg">No payments yet</h4>
        <p className="mx-auto mt-2 max-w-sm text-sm text-lp-on-surface-variant">
          Completed consultation payments will appear here once clients pay.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-2xl border border-lp-outline-variant/25 bg-white md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className="h-10 w-[18%] px-4 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Amount
              </TableHead>
              <TableHead className="h-10 w-[24%] px-4 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Client
              </TableHead>
              <TableHead className="h-10 w-[18%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Method
              </TableHead>
              <TableHead className="h-10 w-[18%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Date
              </TableHead>
              <TableHead className="h-10 w-[12%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Status
              </TableHead>
              <TableHead className="h-10 w-[10%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Ref
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.map((payment) => (
              <TableRow
                key={payment.id}
                className="border-lp-outline-variant/15 hover:bg-lp-surface-container-low/30"
              >
                <TableCell className="align-middle px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        payment.status === "completed"
                          ? "bg-green-50 text-green-600"
                          : "bg-blue-50 text-blue-600"
                      )}
                    >
                      <IndianRupee className="size-4" aria-hidden />
                    </div>
                    <span className="font-heading text-sm font-bold tabular-nums text-lp-on-surface">
                      {formatAmount(payment.amount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="align-middle px-4 py-3 text-sm font-medium text-lp-on-surface">
                  {payment.clientName || "Direct payment"}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm capitalize text-lp-on-surface-variant">
                  {payment.paymentMethod}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm tabular-nums text-lp-on-surface-variant">
                  {formatDate(payment.createdAt, mounted)}
                </TableCell>
                <TableCell className="align-middle px-3 py-3">
                  <PaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-xs text-lp-on-surface-variant">
                  <span className="line-clamp-1">{payment.transactionId || "—"}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {sortedPayments.map((payment) => {
          const isOpen = expandedIds.has(payment.id);
          return (
            <div
              key={payment.id}
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
                onClick={() => toggleRow(payment.id, !isOpen)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    payment.status === "completed"
                      ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-blue-600"
                  )}
                >
                  <IndianRupee className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-base font-bold text-lp-cta-bg">
                    {formatAmount(payment.amount)}
                  </p>
                  <p className="truncate text-sm text-lp-on-surface-variant">
                    {payment.clientName || "Direct payment"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <PaymentStatusBadge status={payment.status} />
                    <Badge
                      variant="outline"
                      className="rounded-full border-lp-outline-variant/40 bg-lp-surface-container-low px-2 py-0 text-[10px] font-semibold capitalize text-lp-on-surface-variant"
                    >
                      {payment.paymentMethod}
                    </Badge>
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
                      <MobileDetail
                        icon={User}
                        label="Client"
                        value={payment.clientName || "Direct payment"}
                      />
                      <MobileDetail
                        icon={CreditCard}
                        label="Payment method"
                        value={payment.paymentMethod}
                      />
                      <MobileDetail
                        icon={CalendarIcon}
                        label="Date"
                        value={formatDate(payment.createdAt, mounted)}
                      />
                      {payment.transactionId ? (
                        <MobileDetail
                          icon={CreditCard}
                          label="Transaction ref"
                          value={payment.transactionId}
                        />
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
