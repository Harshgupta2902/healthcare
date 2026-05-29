"use client";

import { getCrashlytics, recordError, type Crashlytics } from "@firebase/crashlytics";
import { isFirebaseConfigured } from "./config";
import { getFirebaseApp } from "./app";

let crashlyticsInstance: Crashlytics | null | undefined;

function resolveCrashlytics(): Crashlytics | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (crashlyticsInstance !== undefined) {
    return crashlyticsInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    crashlyticsInstance = null;
    return null;
  }

  try {
    crashlyticsInstance = getCrashlytics(app, {
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
    });
  } catch {
    crashlyticsInstance = null;
  }

  return crashlyticsInstance;
}

export function recordClientError(
  error: unknown,
  attributes?: Record<string, string | number | boolean>,
): void {
  const crashlytics = resolveCrashlytics();
  if (!crashlytics) {
    return;
  }

  const normalized =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : "Unknown client error");

  recordError(crashlytics, normalized, attributes);
}
