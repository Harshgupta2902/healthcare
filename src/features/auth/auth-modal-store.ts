import type { AuthModalState, OpenAuthOptions } from "./types";

const initialState: AuthModalState = {
  isOpen: false,
  view: "login",
  redirect: null,
  role: null,
  onSuccess: null,
};

let state: AuthModalState = { ...initialState };
const listeners = new Set<(next: AuthModalState) => void>();

function emit() {
  const snapshot = { ...state };
  listeners.forEach((listener) => listener(snapshot));
}

export function getAuthModalState(): AuthModalState {
  return { ...state };
}

export function setAuthModalState(partial: Partial<AuthModalState>) {
  state = { ...state, ...partial };
  emit();
}

export function subscribeAuthModal(listener: (next: AuthModalState) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openAuthModal(options?: OpenAuthOptions) {
  setAuthModalState({
    isOpen: true,
    view: options?.view ?? "login",
    redirect: options?.redirect ?? null,
    role: options?.role ?? null,
    onSuccess: options?.onSuccess ?? null,
  });
}

export function closeAuthModal() {
  setAuthModalState({
    isOpen: false,
    onSuccess: null,
  });
}

export function switchAuthView(view: AuthModalState["view"]) {
  setAuthModalState({ view });
}
