import { getApps, initializeApp } from "firebase/app";
import { nextOnRequestError } from "@firebase/crashlytics";
import { getFirebaseConfig } from "@/lib/firebase/config";

function ensureServerFirebaseApp(): void {
  const config = getFirebaseConfig();
  if (!config || getApps().length > 0) {
    return;
  }
  initializeApp(config);
}

export async function register(): Promise<void> {
  ensureServerFirebaseApp();
}

export const onRequestError = nextOnRequestError({
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
});
