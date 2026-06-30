"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  closeAuthModal,
  getAuthModalState,
  openAuthModal as openAuthModalStore,
  subscribeAuthModal,
} from "./auth-modal-store";
import type { OpenAuthOptions } from "./types";

export type { AuthView, AuthRole, OpenAuthOptions } from "./types";

export { openAuthModalStore as openAuthModal, closeAuthModal };

export function useAuthModal() {
  const [modalState, setModalState] = useState(getAuthModalState);

  useEffect(() => subscribeAuthModal(setModalState), []);

  return {
    ...modalState,
    openAuth: openAuthModalStore,
    closeAuth: closeAuthModal,
  };
}

/** Returns true when the user is signed in; otherwise opens the auth modal. */
export async function ensureAuthenticated(options?: OpenAuthOptions): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return true;

  openAuthModalStore(options);
  return false;
}
