"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { openAuthModal } from "@/features/auth/open-auth-modal";
import { getBookConsultationAccess } from "./actions";
import { BookConsultationContent } from "./BookConsultationContent";
import { BookConsultationPageSkeleton } from "./BookConsultationPageSkeleton";
import { BookConsultationRoleBlocked } from "./BookConsultationRoleBlocked";
import type { BookingUserRole } from "@/lib/booking/require-client-booking";

type AccessStatus =
  | "checking"
  | "unauthenticated"
  | "blocked"
  | "allowed";

function BookConsultationAuthGate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("checking");
  const [blockedRole, setBlockedRole] = useState<BookingUserRole>("professional");
  const [blockedMessage, setBlockedMessage] = useState("");
  const authCheckedRef = useRef(false);

  useEffect(() => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;

    const query = searchParams.toString();
    const returnTo = query ? `${pathname}?${query}` : pathname;

    void (async () => {
      const access = await getBookConsultationAccess();

      if (access.ok) {
        setAccessStatus("allowed");
        return;
      }

      if (access.reason === "unauthenticated") {
        setAccessStatus("unauthenticated");
        openAuthModal({
          view: "login",
          redirect: returnTo,
        });
        return;
      }

      setBlockedRole(access.role);
      setBlockedMessage(access.error);
      setAccessStatus("blocked");
    })();
  }, [pathname, searchParams]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return;

      void getBookConsultationAccess().then((access) => {
        if (access.ok) {
          setAccessStatus("allowed");
          return;
        }
        if (access.reason === "wrong_role") {
          setBlockedRole(access.role);
          setBlockedMessage(access.error);
          setAccessStatus("blocked");
        }
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  if (accessStatus === "checking") {
    return <BookConsultationPageSkeleton />;
  }

  if (accessStatus === "blocked") {
    return <BookConsultationRoleBlocked role={blockedRole} message={blockedMessage} />;
  }

  return (
    <BookConsultationContent authReady={accessStatus === "allowed"} />
  );
}

export function BookConsultationPageClient() {
  return (
    <Suspense fallback={<BookConsultationPageSkeleton />}>
      <BookConsultationAuthGate />
    </Suspense>
  );
}
