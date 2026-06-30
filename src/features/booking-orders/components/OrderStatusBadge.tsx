import { cn } from "@/lib/utils";
import type { BookingOrderFailureReason, BookingOrderStatus } from "../types";

const STATUS_LABEL: Record<BookingOrderStatus, string> = {
  pending: "Pending payment",
  processing: "Processing",
  confirmed: "Confirmed",
  failed: "Failed",
};

const FAILURE_LABEL: Record<BookingOrderFailureReason, string> = {
  expired: "Expired",
  payment_declined: "Payment declined",
  payment_error: "Payment error",
  fulfillment_error: "Setup failed",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({
  status,
  failureReason,
  className,
}: {
  status: BookingOrderStatus;
  failureReason?: BookingOrderFailureReason | null;
  className?: string;
}) {
  const label =
    status === "failed" && failureReason
      ? FAILURE_LABEL[failureReason]
      : STATUS_LABEL[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
        status === "confirmed" && "bg-emerald-100 text-emerald-700",
        status === "pending" && "bg-amber-100 text-amber-800",
        status === "processing" && "bg-blue-100 text-blue-700",
        status === "failed" && "bg-red-100 text-red-700",
        className,
      )}
    >
      {label}
    </span>
  );
}
