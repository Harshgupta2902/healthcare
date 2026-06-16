"use client";

import Link from "next/link";
import { Calendar, IndianRupee } from "lucide-react";
import { LpButton } from "@/components/ui/lp-button";
import { formatBookingDateLabel, formatBookingTimeLabel } from "@/lib/booking-display";
import { buildBookingSuccessHref } from "@/features/booking-orders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { ClientOrderHistoryItem } from "../types";

export function OrderHistoryList({ orders }: { orders: ClientOrderHistoryItem[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24 bg-lp-surface-container-low/50 rounded-xl sm:rounded-3xl border-2 border-dashed border-lp-outline-variant/30">
        <IndianRupee className="h-12 w-12 mx-auto mb-4 text-lp-on-surface-variant/30" />
        <h4 className="text-lg font-black text-lp-cta-bg">No orders yet</h4>
        <p className="text-lp-on-surface-variant mt-1">Your consultation orders will appear here.</p>
        <LpButton asChild className="mt-6">
          <Link href="/book-consultation">Book a consultation</Link>
        </LpButton>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-4 sm:gap-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="group w-full min-w-0 overflow-hidden rounded-xl border border-lp-outline-variant/30 bg-white p-5 shadow-sm transition-all hover:shadow-lg sm:rounded-3xl sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-sans text-[10px] font-black uppercase tracking-widest text-lp-on-surface-variant">
                {order.orderNumber}
              </p>
              <h4 className="mt-1 font-black text-lg text-lp-cta-bg">{order.consultantName}</h4>
            </div>
            <OrderStatusBadge status={order.status} failureReason={order.failureReason} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-lp-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0 text-lp-brand" aria-hidden />
              {formatBookingDateLabel(order.appointmentDate)} ·{" "}
              {formatBookingTimeLabel(order.appointmentTime)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-lp-cta-bg">
              {order.amountPaise > 0
                ? `₹${(order.amountPaise / 100).toFixed(2)}`
                : "Free"}
            </span>
          </div>

          {/* {order.status === "confirmed" && order.guestAppointmentId ? (
            <div className="mt-4">
              <LpButton asChild variant="outline" size="sm">
                <Link href={buildBookingSuccessHref(order.guestAppointmentId)}>View confirmation</Link>
              </LpButton>
            </div>
          ) : null} */}

          {order.status === "failed" ? (
            <div className="mt-4">
              <LpButton asChild size="sm">
                <Link href="/book-consultation">Book again</Link>
              </LpButton>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
