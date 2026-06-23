"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { openAuthModal } from "@/features/auth/open-auth-modal";
import { BookConsultationContent } from "./BookConsultationContent";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

function BookConsultationAuthGate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const authCheckedRef = useRef(false);

  useEffect(() => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;

    const query = searchParams.toString();
    const returnTo = query ? `${pathname}?${query}` : pathname;

    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthStatus("unauthenticated");
        openAuthModal({
          view: "login",
          redirect: returnTo,
        });
        return;
      }

      setAuthStatus("authenticated");
    })();
  }, [pathname, searchParams]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthStatus("authenticated");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authStatus === "checking") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-lp-surface">
        <Loader2 className="size-12 animate-spin text-lp-brand" aria-label="Loading" />
      </div>
    );
  }

  return <BookConsultationContent authReady={authStatus === "authenticated"} />;
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
