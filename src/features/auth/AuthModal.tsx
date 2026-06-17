"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { safeInternalRedirect } from "@/lib/safe-redirect";
import { DEFAULT_REGISTRATION_SETTINGS } from "@/lib/registration-settings";
import {
  REGISTRATION_OTP_EXPIRY_MINUTES,
  REGISTRATION_OTP_LENGTH,
} from "@/lib/registration-constants";
import { closeAuthModal, openAuthModal, switchAuthView } from "./auth-modal-store";
import { useAuthModal } from "./open-auth-modal";
import { getAuthRegistrationSettings } from "./actions";
import { AuthLoginForm } from "./AuthLoginForm";
import { AuthRegisterForm } from "./AuthRegisterForm";

function AuthModalBody({
  registrationSettings,
  onProcessingChange,
}: {
  registrationSettings: {
    emailOtpEnabled: boolean;
    otpLength: number;
    otpExpiryMinutes: number;
    resendCooldownSeconds: number;
  };
  onProcessingChange: (processing: boolean) => void;
}) {
  const { view, redirect, role, onSuccess } = useAuthModal();
  const redirectPath = safeInternalRedirect(redirect);

  const handleAuthSuccess = useCallback(() => {
    onSuccess?.();
    closeAuthModal();
  }, [onSuccess]);

  if (view === "signup") {
    return (
      <AuthRegisterForm
        emailOtpEnabled={registrationSettings.emailOtpEnabled}
        otpLength={registrationSettings.otpLength}
        otpExpiryMinutes={registrationSettings.otpExpiryMinutes}
        resendCooldownSeconds={registrationSettings.resendCooldownSeconds}
        redirectPath={redirectPath}
        defaultRole={role ?? undefined}
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={() => switchAuthView("login")}
        onProcessingChange={onProcessingChange}
      />
    );
  }

  return (
    <AuthLoginForm
      redirectPath={redirectPath}
      onSuccess={handleAuthSuccess}
      onSwitchToSignup={() => switchAuthView("signup")}
      onProcessingChange={onProcessingChange}
      compact
    />
  );
}

export function AuthModal() {
  const { isOpen, view } = useAuthModal();
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationSettings, setRegistrationSettings] = useState({
    emailOtpEnabled: DEFAULT_REGISTRATION_SETTINGS.email_otp_enabled,
    otpLength: REGISTRATION_OTP_LENGTH,
    otpExpiryMinutes: REGISTRATION_OTP_EXPIRY_MINUTES,
    resendCooldownSeconds: DEFAULT_REGISTRATION_SETTINGS.resend_cooldown_seconds,
    loaded: false,
  });

  useEffect(() => {
    if (!isOpen) setIsProcessing(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || registrationSettings.loaded) return;

    let cancelled = false;

    void getAuthRegistrationSettings().then((settings) => {
      if (cancelled) return;
      setRegistrationSettings({ ...settings, loaded: true });
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, registrationSettings.loaded]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && isProcessing) return;
        if (!open) closeAuthModal();
      }}
    >
      <DialogContent
        overlayClassName="auth-modal-overlay z-[100] !bg-black/55 dark:!bg-black/70"
        closeButtonClassName="top-5 right-5 flex size-9 items-center justify-center rounded-full border border-lp-outline-variant/40 bg-white text-lp-on-surface-variant opacity-100 shadow-sm transition-colors hover:border-lp-brand/30 hover:bg-lp-surface-container-low hover:text-lp-brand disabled:pointer-events-none disabled:opacity-40"
        className={`z-[101] max-h-[min(92dvh,900px)] gap-0 overflow-visible rounded-2xl border-0 bg-transparent p-0 shadow-none ${view === "signup" ? "sm:max-w-[560px]" : "sm:max-w-[480px]"}`}
        showCloseButton={!isProcessing}
        onInteractOutside={(event) => {
          if (isProcessing) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isProcessing) event.preventDefault();
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex max-h-[min(92dvh,900px)] flex-col overflow-hidden rounded-2xl border border-lp-outline-variant/30 bg-white shadow-[0_24px_64px_rgba(11,28,48,0.16)]"
            >
              <div className="relative border-b border-lp-outline-variant/20 px-6 pb-5 pt-7 text-center">
                <DialogHeader className="mt-3 space-y-1.5 text-center sm:text-center">
                  <DialogTitle className="font-heading text-lg font-bold uppercase tracking-[0.14em] text-lp-cta-bg">
                    {view === "signup" ? "Sign Up" : "Sign In"}
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="overflow-y-auto px-6 pb-7 pt-4">
                <AuthModalBody
                  registrationSettings={registrationSettings}
                  onProcessingChange={setIsProcessing}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function AuthUrlSync() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = searchParams.get("auth");
    const redirect = searchParams.get("redirect");
    const role = searchParams.get("role");
    const registered = searchParams.get("registered");

    if (auth !== "login" && auth !== "signup") return;

    openAuthModal({
      view: auth,
      redirect: redirect ?? undefined,
      role: role === "professional" || role === "client" ? role : undefined,
    });

    if (auth === "login" && registered === "true") {
      toast.success("Account created successfully! Please log in to continue.");
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    params.delete("redirect");
    params.delete("role");
    params.delete("registered");
    const query = params.toString();
    router.replace(query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }, [router, searchParams]);

  return null;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AuthModal />
      <Suspense fallback={null}>
        <AuthUrlSync />
      </Suspense>
    </>
  );
}
