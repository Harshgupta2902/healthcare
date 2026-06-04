"use client";

import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";
import { getFirebaseConfig } from "./config";
import { getFirebaseApp } from "./app";
import { firebaseLog, firebaseWarn, isFirebaseDebugEnabled } from "./debug";

let analyticsInstance: Analytics | null | undefined;
let analyticsFailureLogged = false;
let analyticsReadyLogged = false;

const SENSITIVE_QUERY =
  /([?&])(email|token|code|password|access_token|refresh_token|name|phone)=([^&]*)/gi;

export function sanitizePagePath(path: string): string {
  return path.replace(SENSITIVE_QUERY, "$1$2=redacted");
}

function logAnalyticsFailureOnce(reason: string, details?: Record<string, unknown>): void {
  if (analyticsFailureLogged) return;
  analyticsFailureLogged = true;
  firebaseWarn(`Analytics not available: ${reason}`, details);
}

async function resolveAnalytics(): Promise<Analytics | null> {
  const config = getFirebaseConfig();
  if (!config?.measurementId) {
    logAnalyticsFailureOnce("missing NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID", {
      hasFirebaseConfig: Boolean(config),
    });
    return null;
  }

  if (analyticsInstance !== undefined) {
    return analyticsInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    analyticsInstance = null;
    logAnalyticsFailureOnce("Firebase app failed to initialize (check API_KEY, PROJECT_ID, APP_ID)");
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    analyticsInstance = null;
    logAnalyticsFailureOnce(
      "firebase/analytics isSupported() returned false",
      {
        hint: "Common causes: ad blocker, strict browser privacy, unsupported browser, or cookies disabled",
      },
    );
    return null;
  }

  try {
    analyticsInstance = getAnalytics(app);
    if (!analyticsReadyLogged) {
      analyticsReadyLogged = true;
      firebaseLog("Analytics initialized", {
        measurementId: config.measurementId,
        projectId: config.projectId,
      });
    }
    return analyticsInstance;
  } catch (error) {
    analyticsInstance = null;
    logAnalyticsFailureOnce("getAnalytics() threw", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function initFirebaseAnalytics(): Promise<void> {
  await resolveAnalytics();
}

export async function trackPageView(pagePath: string, pageTitle?: string): Promise<void> {
  const analytics = await resolveAnalytics();
  if (!analytics) {
    return;
  }

  const safePath = sanitizePagePath(pagePath);
  logEvent(analytics, "page_view", {
    page_path: safePath,
    page_title: pageTitle ?? (typeof document !== "undefined" ? document.title : safePath),
    page_location:
      typeof window !== "undefined" ? sanitizePagePath(window.location.href) : safePath,
  });

  if (isFirebaseDebugEnabled()) {
    firebaseLog("Analytics page_view sent", { page_path: safePath });
  }
}

export async function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  const analytics = await resolveAnalytics();
  if (!analytics) {
    return;
  }

  logEvent(analytics, eventName, params);
}
