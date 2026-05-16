"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { BookConsultationContent } from "./BookConsultationContent";

export default function BookConsultationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-lp-surface">
          <Loader2 className="size-12 animate-spin text-lp-brand" aria-label="Loading" />
        </div>
      }
    >
      <BookConsultationContent />
    </Suspense>
  );
}
