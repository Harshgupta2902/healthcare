"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
}: {
  registrationSettings: {
    emailOtpEnabled: boolean;
    otpLength: number;
    otpExpiryMinutes: number;
    resendCooldownSeconds: number;
  };
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
      />
    );
  }

  return (
    <AuthLoginForm
      redirectPath={redirectPath}
      onSuccess={handleAuthSuccess}
      onSwitchToSignup={() => switchAuthView("signup")}
      compact
    />
  );
}

export function AuthModal() {
  const { isOpen, view } = useAuthModal();
  const [registrationSettings, setRegistrationSettings] = useState({
    emailOtpEnabled: DEFAULT_REGISTRATION_SETTINGS.email_otp_enabled,
    otpLength: REGISTRATION_OTP_LENGTH,
    otpExpiryMinutes: REGISTRATION_OTP_EXPIRY_MINUTES,
    resendCooldownSeconds: DEFAULT_REGISTRATION_SETTINGS.resend_cooldown_seconds,
    loaded: false,
  });

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
        if (!open) closeAuthModal();
      }}
    >
      <DialogContent
        overlayClassName="liquid-glass-overlay"
        className="max-h-[min(92dvh,900px)] gap-0 overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-none sm:max-w-[480px]"
        showCloseButton
      >
        <div className="liquid-glass-strong flex max-h-[min(92dvh,900px)] flex-col overflow-hidden rounded-2xl border border-white/60 shadow-[0_24px_64px_rgba(11,28,48,0.18)] dark:border-white/10">
        <div className="border-b border-white/40 px-6 pb-4 pt-8 text-center dark:border-white/10">
          <p className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text font-heading text-2xl font-extrabold tracking-tight text-transparent">
            HealthHere
          </p>
          <DialogHeader className="mt-4 text-left">
            <DialogTitle className="font-heading text-xl font-bold uppercase tracking-wide text-lp-cta-bg">
              {view === "signup" ? "Sign Up" : "Sign In"}
            </DialogTitle>
            <DialogDescription className="font-sans text-sm text-lp-on-surface-variant">
              {view === "signup"
                ? "Create your account to book consultations and manage care."
                : "Sign in to continue booking and access your dashboard."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto px-6 pb-8 pt-2">
          <AuthModalBody registrationSettings={registrationSettings} />
        </div>
        </div>
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
