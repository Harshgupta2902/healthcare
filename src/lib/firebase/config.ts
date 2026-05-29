export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function getFirebaseConfig(): FirebaseWebConfig | null {
  const apiKey = readEnv("NEXT_PUBLIC_FIREBASE_API_KEY");
  const projectId = readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const appId = readEnv("NEXT_PUBLIC_FIREBASE_APP_ID");

  if (!apiKey || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") ?? `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket:
      readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ?? `${projectId}.appspot.com`,
    messagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ?? "",
    appId,
    measurementId: readEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
  };
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}
