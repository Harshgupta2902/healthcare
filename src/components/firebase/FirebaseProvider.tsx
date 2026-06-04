"use client";

import { FirebaseCrashlytics } from "@firebase/crashlytics/react";
import type { FirebaseApp } from "firebase/app";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getFirebaseApp } from "@/lib/firebase/app";
import { initFirebaseAnalytics, trackPageView } from "@/lib/firebase/analytics";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { firebaseLog, firebaseWarn, logFirebaseEnvStatus } from "@/lib/firebase/debug";
import { probeClientCrashlytics } from "@/lib/firebase/crashlytics";

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
    logFirebaseEnvStatus("client");

    if (!isFirebaseConfigured()) {
      firebaseWarn("FirebaseProvider: skipping init — required NEXT_PUBLIC_* env vars missing");
      return;
    }

    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) {
      firebaseWarn("FirebaseProvider: getFirebaseApp() returned null");
      return;
    }

    firebaseLog("FirebaseProvider: app ready", {
      projectId: firebaseApp.options.projectId,
      hasMeasurementId: Boolean(firebaseApp.options.measurementId),
    });

    setApp(firebaseApp);
    probeClientCrashlytics();
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
