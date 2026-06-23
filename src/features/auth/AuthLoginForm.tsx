"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2, Eye, EyeOff, KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";
import { getDeviceFingerprintHash } from "@/lib/device-fingerprint";
import { safeInternalRedirect } from "@/lib/safe-redirect";
import { signIn } from "@/features/profile/actions";
import { LpButton } from "@/components/ui/lp-button";
import { LpTextField } from "@/components/ui/lp-text-field";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export type AuthLoginFormProps = {
  redirectPath?: string | null;
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onProcessingChange?: (processing: boolean) => void;
  compact?: boolean;
};

export function AuthLoginForm({
  redirectPath,
  onSuccess,
  onSwitchToSignup,
  onProcessingChange,
  compact = false,
}: AuthLoginFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [authPhase, setAuthPhase] = useState<"idle" | "signing-in" | "redirecting">("idle");
  const [showPassword, setShowPassword] = useState(false);
  const isBusy = authPhase !== "idle";
  const router = useRouter();

  useEffect(() => {
    onProcessingChange?.(isBusy);
  }, [isBusy, onProcessingChange]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setAuthPhase("signing-in");

    try {
      const deviceHash = await getDeviceFingerprintHash();
      const result = await signIn({
        email: formData.email,
        password: formData.password,
        deviceHash,
      });

      if (result.error) {
        toast.error(result.error || "Invalid email or password.");
        setAuthPhase("idle");
        return;
      }

      toast.success("Welcome back! You've successfully logged in.");

      const userRole = result.role || "client";
      const explicitRedirect = safeInternalRedirect(redirectPath ?? null);
      let nextPath = explicitRedirect;
      if (!nextPath) {
        nextPath = userRole === "admin" ? "/application/enter" : "/dashboard";
      }

      setAuthPhase("redirecting");

      if (onSuccess) {
        onSuccess();
      }

      if (explicitRedirect) {
        window.location.assign(explicitRedirect);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setAuthPhase("idle");
    }
  };

  return (
    <div className="relative">
      {isBusy && (
        <div
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-3 rounded-xl bg-white/95 px-6 text-center"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-8 w-8 shrink-0 animate-spin text-lp-brand" />
          <p className="text-xs font-semibold uppercase tracking-widest text-lp-on-surface-variant">
            {authPhase === "signing-in" ? "Signing you in..." : "Redirecting..."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-6"}>
        <LpTextField
          id="auth-login-email"
          name="email"
          type="email"
          autoComplete="email"
          label="Email"
          placeholder="name@clinic.com"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isBusy}
          error={errors.email}
          startIcon={<Mail className="size-5 shrink-0" aria-hidden />}
          surface="muted"
          rounding="lg"
        />

        <div className="space-y-2">
          <LpTextField
            id="auth-login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isBusy}
            error={errors.password}
            startIcon={<KeyRound className="size-5 shrink-0" aria-hidden />}
            endSlot={
              <LpButton
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isBusy}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </LpButton>
            }
            surface="muted"
            rounding="lg"
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="font-sans text-xs font-semibold uppercase tracking-wide text-lp-brand transition-all hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <LpButton type="submit" variant="primary" fullWidth disabled={isBusy}>
          {authPhase === "idle" ? (
            <>
              <Shield className="size-5 shrink-0" aria-hidden />
              Sign In
            </>
          ) : (
            <>
              <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
              {authPhase === "signing-in" ? "Signing you in..." : "Redirecting..."}
            </>
          )}
        </LpButton>
      </form>

      {onSwitchToSignup ? (
        <div className="mt-6 text-center">
          <p className="font-sans text-sm leading-5 text-lp-on-surface-variant">
            New to HealthHere?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              disabled={isBusy}
              className="font-bold text-lp-brand transition-all hover:underline disabled:pointer-events-none disabled:opacity-50"
            >
              Sign Up
            </button>
          </p>
        </div>
      ) : null}
    </div>
  );
}
