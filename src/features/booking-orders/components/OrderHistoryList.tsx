"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  ChevronDown,
  IndianRupee,
  Loader2,
  User,
} from "lucide-react";
import { LpButton } from "@/components/ui/lp-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBookingDateLabel, formatBookingTimeLabel } from "@/lib/booking-display";
import type { ClientOrderHistoryItem } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { cn } from "@/lib/utils";
import {
  ClientListEmpty,
  ClientMobileDetail,
  clientListTableHead,
  clientListTableRow,
  clientListTableWrap,
  mobileRowShell,
} from "@/app/dashboard/_components/client-list-shared";

type OrderHistoryListProps = {
  orders: ClientOrderHistoryItem[];
  isLoading?: boolean;
  mounted?: boolean;
};

function formatAmount(paise: number) {
  if (paise <= 0) return "Free";
  return `₹${(paise / 100).toFixed(2)}`;
}

export function OrderHistoryList({ orders, isLoading = false, mounted = true }: OrderHistoryListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const didAutoExpand = useRef(false);

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  useEffect(() => {
    if (!didAutoExpand.current && sortedOrders.length > 0) {
      didAutoExpand.current = true;
      setExpandedIds(new Set([sortedOrders[0].id]));
    }
  }, [sortedOrders]);

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

  if (sortedOrders.length === 0) {
    return (
      <div className="space-y-6">
        <ClientListEmpty
          icon={IndianRupee}
          title="No orders yet"
          description="Your consultation orders will appear here after you book."
        />
        <div className="text-center">
          <LpButton asChild>
            <Link href="/book-consultation">Book a consultation</Link>
          </LpButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={clientListTableWrap}>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className={cn(clientListTableHead, "w-[16%]")}>Order</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[22%] px-3")}>Consultant</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[22%] px-3")}>Schedule</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[12%] px-3")}>Amount</TableHead>
              <TableHead className={cn(clientListTableHead, "w-[14%] px-3")}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow key={order.id} className={clientListTableRow}>
                <TableCell className="align-middle px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <IndianRupee className="size-4" aria-hidden />
                    </div>
                    <span className="font-mono text-xs font-semibold text-lp-on-surface-variant">
                      {order.orderNumber}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm font-medium text-lp-on-surface">
                  {order.consultantName}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {formatBookingDateLabel(order.appointmentDate)} ·{" "}
                  {formatBookingTimeLabel(order.appointmentTime)}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm font-semibold tabular-nums text-lp-cta-bg">
                  {formatAmount(order.amountPaise)}
                </TableCell>
                <TableCell className="align-middle px-3 py-3">
                  <OrderStatusBadge status={order.status} failureReason={order.failureReason} />
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {sortedOrders.map((order) => {
          const isOpen = expandedIds.has(order.id);
          return (
            <div key={order.id} className={mobileRowShell(isOpen)}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleRow(order.id, !isOpen)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <IndianRupee className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-base font-bold text-lp-cta-bg">
                    {formatAmount(order.amountPaise)}
                  </p>
                  <p className="truncate text-sm text-lp-on-surface-variant">{order.consultantName}</p>
                </div>
                <OrderStatusBadge status={order.status} failureReason={order.failureReason} />
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
                      <ClientMobileDetail icon={User} label="Order" value={order.orderNumber} />
                      <ClientMobileDetail
                        icon={CalendarIcon}
                        label="Schedule"
                        value={`${formatBookingDateLabel(order.appointmentDate)} · ${formatBookingTimeLabel(order.appointmentTime)}`}
                      />
                      {order.status === "failed" ? (
                        <LpButton asChild size="sm" className="w-full rounded-xl">
                          <Link href="/book-consultation">Book again</Link>
                        </LpButton>
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
