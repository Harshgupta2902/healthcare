"use client";

import { getCrashlytics, recordError, type Crashlytics } from "@firebase/crashlytics";
import { isFirebaseConfigured } from "./config";
import { getFirebaseApp } from "./app";
import { firebaseLog, firebaseWarn } from "./debug";

let crashlyticsInstance: Crashlytics | null | undefined;
let crashlyticsDiagLogged = false;

function resolveCrashlytics(): Crashlytics | null {
  if (!isFirebaseConfigured()) {
    if (!crashlyticsDiagLogged) {
      crashlyticsDiagLogged = true;
      firebaseWarn(
        "Crashlytics not available: Firebase env incomplete (API_KEY, PROJECT_ID, APP_ID)",
      );
    }
    return null;
  }

  if (crashlyticsInstance !== undefined) {
    return crashlyticsInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    crashlyticsInstance = null;
    if (!crashlyticsDiagLogged) {
      crashlyticsDiagLogged = true;
      firebaseWarn("Crashlytics not available: Firebase app failed to initialize");
    }
    return null;
  }

  try {
    crashlyticsInstance = getCrashlytics(app, {
      appVersion: "healthere-redesign",
    });
    if (!crashlyticsDiagLogged) {
      crashlyticsDiagLogged = true;
      firebaseLog("Crashlytics initialized (client)", {
        appVersion: "healthere-redesign",
      });
    }
  } catch (error) {
    crashlyticsInstance = null;
    if (!crashlyticsDiagLogged) {
      crashlyticsDiagLogged = true;
      firebaseWarn("Crashlytics getCrashlytics() failed", {
        error: error instanceof Error ? error.message : String(error),
        hint: "Web Crashlytics uses the EAP package; ensure Crashlytics is enabled in Firebase Console",
      });
    }
  }

  return crashlyticsInstance;
}

/** Runs Crashlytics init once so diagnostic logs appear in the browser console. */
export function probeClientCrashlytics(): void {
  resolveCrashlytics();
}

export function recordClientError(
  error: unknown,
  attributes?: Record<string, string | number | boolean>,
): void {
  const crashlytics = resolveCrashlytics();
  if (!crashlytics) {
    return;
  }

  firebaseLog("Crashlytics recordError", {
    message: error instanceof Error ? error.message : String(error),
    ...attributes,
  });

  const normalized =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : "Unknown client error");

  recordError(crashlytics, normalized, attributes);
}
