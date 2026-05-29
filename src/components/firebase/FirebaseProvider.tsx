"use client";

import { FirebaseCrashlytics } from "@firebase/crashlytics/react";
import type { FirebaseApp } from "firebase/app";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getFirebaseApp } from "@/lib/firebase/app";
import { initFirebaseAnalytics, trackPageView } from "@/lib/firebase/analytics";
import { isFirebaseConfigured } from "@/lib/firebase/config";

function FirebasePageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }
    void trackPageView(pathname);
  }, [pathname]);

  return null;
}

export function FirebaseProvider() {
  const [app, setApp] = useState<FirebaseApp | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) {
      return;
    }

    setApp(firebaseApp);
    void initFirebaseAnalytics();
  }, []);

  if (!app) {
    return null;
  }

  return (
    <>
      <FirebaseCrashlytics firebaseApp={app} />
      <Suspense fallback={null}>
        <FirebasePageViewTracker />
      </Suspense>
    </>
  );
}
