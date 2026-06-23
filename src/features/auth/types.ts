export type AuthView = "login" | "signup";

export type AuthRole = "client" | "professional";

export interface OpenAuthOptions {
  view?: AuthView;
  redirect?: string;
  role?: AuthRole;
  onSuccess?: () => void;
  /** Called when the user closes the modal without signing in. */
  onDismiss?: () => void;
}

export interface AuthModalState {
  isOpen: boolean;
  view: AuthView;
  redirect: string | null;
  role: AuthRole | null;
  onSuccess: (() => void) | null;
  onDismiss: (() => void) | null;
}
