"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { openAuthModal } from "@/features/auth/open-auth-modal";
import { BookConsultationContent } from "./BookConsultationContent";

function BookConsultationAuthGate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      }
    })();
  }, [pathname, searchParams]);

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

export function BookConsultationPageClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-lp-surface">
          <Loader2 className="size-12 animate-spin text-lp-brand" aria-label="Loading" />
        </div>
      }
    >
      <BookConsultationAuthGate />
    </Suspense>
  );
}
