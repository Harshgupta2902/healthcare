"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar, IndianRupee, Loader2, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { openAuthModal } from "@/features/auth/open-auth-modal";
import { LpButton } from "@/components/ui/lp-button";
import {
  BookConsultationProgressDialog,
} from "@/app/book-consultation/BookConsultationProgressDialog";
import {
  buildBookingSuccessHref,
  cancelBookingOrder,
  createRazorpayCheckoutOrder,
  finalizeBookingOrder,
  getCheckoutOrder,
  markBookingOrderFulfillmentFailed,
  processMockPayment,
  verifyRazorpayPayment,
  type CheckoutOrderView,
} from "@/features/booking-orders";
import { openRazorpayCheckout } from "@/features/booking-orders/lib/razorpay-checkout";
import { RazorpayCheckoutPreload } from "./RazorpayCheckoutPreload";
import { OrderCountdown } from "@/features/booking-orders/components/OrderCountdown";
import { OrderStatusBadge } from "@/features/booking-orders/components/OrderStatusBadge";
import { formatBookingDateLabel, formatBookingTimeLabel } from "@/lib/booking-display";

type FulfillmentState = {
  orderId: string;
  guestAppointmentId: string;
  transactionId: string | null;
  sessionKey: number;
  patientLabel: string;
};

export function BookConsultationCheckoutClient({ orderRef }: { orderRef: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authReady, setAuthReady] = useState(false);
  const [order, setOrder] = useState<CheckoutOrderView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, startPayTransition] = useTransition();
  const [fulfillment, setFulfillment] = useState<FulfillmentState | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const reloadOrder = useCallback(async () => {
    const res = await getCheckoutOrder({ orderRef });
    if ("error" in res && res.error) {
      setLoadError(res.error);
      setOrder(null);
      return;
    }
    if ("success" in res && res.success) {
      setLoadError(null);
      setOrder(res.order);
    }
  }, [orderRef]);

  useEffect(() => {
    const query = searchParams.toString();
    const returnTo = query ? `${pathname}?${query}` : pathname;

    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        openAuthModal({ view: "login", redirect: returnTo });
        return;
      }

      setAuthReady(true);
    })();
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!authReady) return;
    void (async () => {
      setIsLoading(true);
      await reloadOrder();
      setIsLoading(false);
    })();
  }, [authReady, reloadOrder]);

  useEffect(() => {
    if (!authReady || !order) return;
    if (order.status !== "processing" || !order.guestAppointmentId || fulfillment) return;

    setFulfillment({
      orderId: order.id,
      guestAppointmentId: order.guestAppointmentId,
      transactionId: null,
      sessionKey: Date.now(),
      patientLabel: `${order.snapshot.firstName} ${order.snapshot.lastName}`.trim(),
    });
  }, [authReady, order, fulfillment]);

  const handleExpired = useCallback(() => {
    void reloadOrder();
  }, [reloadOrder]);

  const handlePaymentSuccess = (res: {
    orderId: string;
    guestAppointmentId: string;
    transactionId: string | null;
  }) => {
    setFulfillment({
      orderId: res.orderId,
      guestAppointmentId: res.guestAppointmentId,
      transactionId: res.transactionId,
      sessionKey: Date.now(),
      patientLabel: `${order!.snapshot.firstName} ${order!.snapshot.lastName}`.trim(),
    });
  };

  const handleMockPay = (outcome: "success" | "declined") => {
    if (!order) return;

    startPayTransition(async () => {
      const res = await processMockPayment({ orderId: order.id, outcome });
      if ("error" in res && res.error) {
        toast.error(res.error);
        await reloadOrder();
        return;
      }

      if ("declined" in res && res.declined) {
        toast.error("Payment was declined.");
        await reloadOrder();
        return;
      }

      if (!("success" in res) || !res.success) return;

      if (!("guestAppointmentId" in res)) return;

      handlePaymentSuccess({
        orderId: res.orderId,
        guestAppointmentId: res.guestAppointmentId,
        transactionId: res.transactionId,
      });
    });
  };

  const handleRazorpayPay = () => {
    if (!order) return;

    const razorpayKeyId = order.razorpayKeyId;
    if (!razorpayKeyId) {
      toast.error("Razorpay is not configured. Please contact support.");
      return;
    }

    startPayTransition(async () => {
      const created = await createRazorpayCheckoutOrder({ orderId: order.id });
      if ("error" in created && created.error) {
        toast.error(created.error);
        return;
      }
      if (!("success" in created) || !created.success) {
        toast.error("Could not create payment order. Please try again.");
        return;
      }

      const checkout = await openRazorpayCheckout({
        key: razorpayKeyId,
        amount: created.amount,
        currency: created.currency,
        orderId: created.orderId,
        orderNumber: order.orderNumber,
        customerName: `${order.snapshot.firstName} ${order.snapshot.lastName}`.trim(),
        customerEmail: order.snapshot.email,
        customerPhone: order.snapshot.phone,
        onDismiss: () => {
          toast.message("Payment cancelled.");
        },
        onFailure: (message) => {
          toast.error(message);
          void reloadOrder();
        },
        onSuccess: (response) => {
          void (async () => {
            const verified = await verifyRazorpayPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if ("error" in verified && verified.error) {
              toast.error(verified.error);
              await reloadOrder();
              return;
            }

            if (!("success" in verified) || !verified.success) return;

            handlePaymentSuccess({
              orderId: verified.orderId,
              guestAppointmentId: verified.guestAppointmentId,
              transactionId: verified.transactionId,
            });
          })();
        },
      });

      if (!checkout.ok) {
        toast.error(
          checkout.reason === "script"
            ? "Could not load Razorpay checkout. Disable ad blockers and refresh the page."
            : "Could not open Razorpay checkout. Please try again.",
        );
      }
    });
  };

  const handlePay = () => {
    if (!order) return;

    if (order.amountPaise <= 0 || order.paymentProvider === "mock") {
      handleMockPay("success");
      return;
    }

    handleRazorpayPay();
  };

  const handleFulfillmentComplete = async (appointmentId: string) => {
    if (!fulfillment) return;

    const fin = await finalizeBookingOrder({
      orderId: fulfillment.orderId,
      guestAppointmentId: appointmentId,
      transactionId: fulfillment.transactionId,
    });

    if ("error" in fin && fin.error) {
      toast.error(fin.error);
      return;
    }

    setFulfillment(null);
    router.push(buildBookingSuccessHref(appointmentId));
  };

  const handleFulfillmentFailed = async () => {
    if (!fulfillment) return;
    await markBookingOrderFulfillmentFailed({ orderId: fulfillment.orderId });
    setFulfillment(null);
    toast.error("We could not finish setting up your consultation. Your order was marked as failed.");
    await reloadOrder();
  };

  if (!authReady || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-lp-surface">
        <Loader2 className="size-12 animate-spin text-lp-brand" aria-label="Loading checkout" />
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-heading text-xl font-bold text-lp-cta-bg">Checkout unavailable</p>
        <p className="mt-2 text-sm text-lp-on-surface-variant">{loadError ?? "Order not found."}</p>
        <LpButton asChild className="mt-6">
          <Link href="/book-consultation">Back to booking</Link>
        </LpButton>
      </div>
    );
  }

  const amountLabel =
    order.amountPaise > 0 ? `₹${(order.amountPaise / 100).toFixed(2)}` : "Free";

  const isPending = order.status === "pending";
  const isFailed = order.status === "failed";
  const isConfirmed = order.status === "confirmed";
  const isProcessing = order.status === "processing";

  return (
    <div className="bg-lp-surface pb-16 pt-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="booking-shadow overflow-hidden rounded-2xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest">
          <div className="border-b border-lp-outline-variant/20 bg-lp-surface-container-low/60 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-lp-on-surface-variant">
                  Order checkout
                </p>
                <h1 className="font-heading text-2xl font-bold text-lp-cta-bg">{order.orderNumber}</h1>
              </div>
              <OrderStatusBadge status={order.status} failureReason={order.failureReason} />
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {isPending ? <OrderCountdown expiresAt={order.expiresAt} onExpired={handleExpired} /> : null}

            <div className="space-y-4 rounded-xl border border-lp-outline-variant/20 bg-lp-surface-container-low/40 p-5">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 shrink-0 text-lp-brand" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                    Consultant
                  </p>
                  <p className="font-semibold text-lp-cta-bg">{order.consultantName}</p>
                  {order.consultantSpecialization ? (
                    <p className="text-sm text-lp-on-surface-variant">{order.consultantSpecialization}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-lp-brand" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                    Schedule
                  </p>
                  <p className="font-semibold text-lp-cta-bg">
                    {formatBookingDateLabel(order.snapshot.date)} ·{" "}
                    {formatBookingTimeLabel(order.snapshot.time)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-lp-brand" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                    Location
                  </p>
                  <p className="font-semibold text-lp-cta-bg">
                    {order.snapshot.city}, {order.snapshot.state}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-lp-outline-variant/20 pt-4">
                <div className="flex items-center gap-2 text-lp-on-surface-variant">
                  <IndianRupee className="h-5 w-5" aria-hidden />
                  <span className="text-sm font-semibold uppercase tracking-wider">Consultation fee</span>
                </div>
                <p className="font-heading text-2xl font-bold text-lp-cta-bg">{amountLabel}</p>
              </div>
            </div>

            {isPending ? (
              <div className="space-y-3">
                {order.paymentProvider === "razorpay" && order.amountPaise > 0 ? (
                  <RazorpayCheckoutPreload
                    enabled
                    onReadyChange={setRazorpayReady}
                  />
                ) : null}
                <LpButton
                  type="button"
                  className="w-full"
                  disabled={
                    isPaying ||
                    (order.paymentProvider === "razorpay" &&
                      order.amountPaise > 0 &&
                      !razorpayReady)
                  }
                  onClick={handlePay}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : order.amountPaise > 0 ? (
                    `Pay ${amountLabel}`
                  ) : (
                    "Confirm booking"
                  )}
                </LpButton>
                {order.amountPaise > 0 && order.paymentProvider === "mock" ? (
                  <button
                    type="button"
                    disabled={isPaying}
                    onClick={() => handleMockPay("declined")}
                    className="w-full text-center text-sm font-medium text-lp-on-surface-variant underline-offset-2 hover:underline disabled:opacity-50"
                  >
                    Simulate payment failure (dev)
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={() => {
                    void cancelBookingOrder({ orderId: order.id }).then(() => reloadOrder());
                  }}
                  className="w-full text-center text-sm text-lp-on-surface-variant hover:text-lp-cta-bg"
                >
                  Cancel order
                </button>
              </div>
            ) : null}

            {isFailed ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-lp-on-surface-variant">
                  This order could not be completed. You can start a new booking anytime.
                </p>
                <LpButton asChild>
                  <Link href="/book-consultation">Book again</Link>
                </LpButton>
              </div>
            ) : null}

            {isProcessing ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-lp-on-surface-variant">
                <Loader2 className="h-4 w-4 animate-spin text-lp-brand" />
                Setting up your consultation…
              </div>
            ) : null}

            {isConfirmed ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-lp-on-surface-variant">This order is already confirmed.</p>
                <LpButton asChild variant="outline">
                  <Link href="/dashboard">View dashboard</Link>
                </LpButton>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <BookConsultationProgressDialog
        open={Boolean(fulfillment)}
        onOpenChange={(open) => {
          if (!open) setFulfillment(null);
        }}
        payload={null}
        guestAppointmentId={fulfillment?.guestAppointmentId ?? null}
        orderId={fulfillment?.orderId ?? null}
        patientLabel={fulfillment?.patientLabel ?? ""}
        sessionKey={fulfillment?.sessionKey ?? 0}
        onComplete={(appointmentId) => {
          void handleFulfillmentComplete(appointmentId);
        }}
        onPipelineFailed={() => {
          void handleFulfillmentFailed();
        }}
      />
    </div>
  );
}
