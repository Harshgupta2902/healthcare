/**
 * Firebase / Analytics / Crashlytics diagnostics.
 *
 * Logs when:
 * - NODE_ENV is "development", or
 * - NEXT_PUBLIC_FIREBASE_DEBUG=true
 *
 * Set NEXT_PUBLIC_FIREBASE_DEBUG=false to silence logs in development.
 */

const LOG_PREFIX = "[HealthHere Firebase]";

export function isFirebaseDebugEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_FIREBASE_DEBUG?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  return process.env.NODE_ENV === "development";
}

export function firebaseLog(message: string, details?: Record<string, unknown>): void {
  if (!isFirebaseDebugEnabled()) return;
  if (details && Object.keys(details).length > 0) {
    console.info(LOG_PREFIX, message, details);
  } else {
    console.info(LOG_PREFIX, message);
  }
}

export function firebaseWarn(message: string, details?: Record<string, unknown>): void {
  if (!isFirebaseDebugEnabled()) return;
  if (details && Object.keys(details).length > 0) {
    console.warn(LOG_PREFIX, message, details);
  } else {
    console.warn(LOG_PREFIX, message);
  }
}

function maskValue(value: string | undefined): string {
  if (!value?.trim()) return "(missing)";
  const v = value.trim();
  if (v.length <= 10) return "***";
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

export type FirebaseEnvChecklist = {
  apiKey: boolean;
  projectId: boolean;
  appId: boolean;
  measurementId: boolean;
  authDomain: boolean;
  storageBucket: boolean;
  messagingSenderId: boolean;
  appInitReady: boolean;
  analyticsReady: boolean;
};

export function getFirebaseEnvChecklist(): FirebaseEnvChecklist {
  const apiKey = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim());
  const projectId = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim());
  const appId = Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim());
  const measurementId = Boolean(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim());

  return {
    apiKey,
    projectId,
    appId,
    measurementId,
    authDomain: Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim()),
    storageBucket: Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()),
    messagingSenderId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim()),
    appInitReady: apiKey && projectId && appId,
    analyticsReady: apiKey && projectId && appId && measurementId,
  };
}

/** Logs which env vars are present (secrets masked). Safe for server + client. */
export function logFirebaseEnvStatus(context: "client" | "server" = "client"): void {
  if (!isFirebaseDebugEnabled()) return;

  const checklist = getFirebaseEnvChecklist();

  firebaseLog(`Environment check (${context})`, {
    requiredForApp: {
      NEXT_PUBLIC_FIREBASE_API_KEY: checklist.apiKey,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: checklist.projectId,
      NEXT_PUBLIC_FIREBASE_APP_ID: checklist.appId,
    },
    requiredForAnalytics: {
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: checklist.measurementId,
    },
    optional: {
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: checklist.authDomain,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: checklist.storageBucket,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: checklist.messagingSenderId,
    },
    valuesPreview: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "(missing)",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() || "(missing)",
      apiKey: maskValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      appId: maskValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    },
    summary: {
      firebaseAppWillInit: checklist.appInitReady,
      analyticsCanRun: checklist.analyticsReady,
      crashlyticsCanRun: checklist.appInitReady,
    },
  });

  if (!checklist.appInitReady) {
    firebaseWarn(
      "Firebase app will NOT start — set API_KEY, PROJECT_ID, and APP_ID (NEXT_PUBLIC_*).",
    );
  }
  if (checklist.appInitReady && !checklist.measurementId) {
    firebaseWarn(
      "Analytics disabled — NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID is missing (Crashlytics can still run).",
    );
  }
}
