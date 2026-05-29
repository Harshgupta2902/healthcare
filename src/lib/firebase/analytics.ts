"use client";

import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";
import { getFirebaseConfig } from "./config";
import { getFirebaseApp } from "./app";

let analyticsInstance: Analytics | null | undefined;

const SENSITIVE_QUERY =
  /([?&])(email|token|code|password|access_token|refresh_token|name|phone)=([^&]*)/gi;

export function sanitizePagePath(path: string): string {
  return path.replace(SENSITIVE_QUERY, "$1$2=redacted");
}

async function resolveAnalytics(): Promise<Analytics | null> {
  if (!getFirebaseConfig()?.measurementId) {
    return null;
  }

  if (analyticsInstance !== undefined) {
    return analyticsInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    analyticsInstance = null;
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    analyticsInstance = null;
    return null;
  }

  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
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
