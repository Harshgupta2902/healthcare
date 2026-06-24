"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { openAuthModal } from "@/features/auth/open-auth-modal";
import { BookConsultationContent } from "./BookConsultationContent";
import { BookConsultationPageSkeleton } from "./BookConsultationPageSkeleton";

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
    return <BookConsultationPageSkeleton />;
  }

  return (
    <BookConsultationContent authReady={authStatus === "authenticated"} />
  );
}

export function BookConsultationPageClient() {
  return (
    <Suspense fallback={<BookConsultationPageSkeleton />}>
      <BookConsultationAuthGate />
    </Suspense>
  );
}
