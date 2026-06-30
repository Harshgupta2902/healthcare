import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { BookConsultationCheckoutClient } from "./BookConsultationCheckoutClient";
import { decodeOrderRef } from "@/features/booking-orders/lib/order-ref";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function BookConsultationCheckoutPage({ searchParams }: PageProps) {
  const { order: orderRef } = await searchParams;

  if (!orderRef?.trim() || !decodeOrderRef(orderRef)) {
    redirect("/book-consultation");
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-lp-surface">
          <Loader2 className="size-12 animate-spin text-lp-brand" aria-label="Loading checkout" />
        </div>
      }
    >
      <BookConsultationCheckoutClient orderRef={orderRef} />
    </Suspense>
  );
}
