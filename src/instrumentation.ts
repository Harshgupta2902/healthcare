import { getApps, initializeApp } from "firebase/app";
import { nextOnRequestError } from "@firebase/crashlytics";
import { getFirebaseConfig } from "@/lib/firebase/config";
import { firebaseLog, firebaseWarn, logFirebaseEnvStatus } from "@/lib/firebase/debug";

function ensureServerFirebaseApp(): boolean {
  const config = getFirebaseConfig();
  if (!config) {
    return false;
  }
  if (getApps().length > 0) {
    return true;
  }
  initializeApp(config);
  return true;
}

export async function register(): Promise<void> {
  logFirebaseEnvStatus("server");

  if (!ensureServerFirebaseApp()) {
    firebaseWarn(
      "instrumentation: server Crashlytics skipped — Firebase env incomplete (API_KEY, PROJECT_ID, APP_ID)",
    );
    return;
  }

  firebaseLog("instrumentation: server Firebase app initialized for Crashlytics onRequestError");
}

export const onRequestError = nextOnRequestError({
  appVersion: "healthere-redesign",
});
