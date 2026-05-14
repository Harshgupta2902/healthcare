"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, Eye, EyeOff, Lock, KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";
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

/** Same-origin path only — blocks open redirects (e.g. ?redirect=https://evil.com). */
function safeInternalRedirect(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.includes("://") || raw.includes("\\")) return null;
  return raw;
}

function LoginContent() {
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
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Account created successfully! Please log in to continue.");
    }
  }, [searchParams]);

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
      const result = await signIn(formData.email, formData.password);

      if (result.error) {
        toast.error(result.error || "Invalid email or password.");
        setAuthPhase("idle");
        return;
      }

      toast.success("Welcome back! You've successfully logged in.");

      const userRole = result.role || "client";

      let redirectPath = safeInternalRedirect(searchParams.get("redirect"));
      if (!redirectPath) {
        redirectPath = userRole === "admin" ? "/application/enter" : "/dashboard";
      }

      setAuthPhase("redirecting");
      router.push(redirectPath);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setAuthPhase("idle");
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-lp-surface font-sans text-lp-on-surface">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-lp-surface/40 px-5 py-4 backdrop-blur-sm md:px-16">
        <Link href="/" className="font-heading text-2xl font-bold leading-8 text-lp-cta-bg">
          HealthHere
        </Link>
        <div className="hidden md:block">
          <span className="font-sans text-sm font-semibold tracking-wide text-lp-on-surface-variant">
            Need help?{" "}
            <Link href="/support" className="font-bold text-lp-brand hover:underline">
              Support
            </Link>
          </span>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col">
        <main className="relative z-0 mt-16 flex flex-1 flex-col items-center justify-center px-5 py-16 md:px-0">
          <div
            className="login-organic-blob -left-24 -top-24 h-[500px] w-[500px] rounded-full bg-lp-secondary-fixed"
            aria-hidden
          />
          <div
            className="login-organic-blob -right-12 bottom-0 h-[400px] w-[400px] rounded-full bg-[#b9c7e4]"
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-12 px-0 lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-16">
            <div className="login-surface-card relative w-full max-w-[480px] rounded-xl p-8 md:p-12">
              {isBusy && (
                <div
                  className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-3 rounded-xl bg-white/85 px-6 text-center backdrop-blur-sm"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <Loader2 className="h-10 w-10 shrink-0 animate-spin text-lp-brand" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-lp-on-surface-variant">
                    {authPhase === "signing-in" ? "Signing you in..." : "Taking you to your dashboard..."}
                  </p>
                </div>
              )}

              <div className="mb-8 text-center">
                <div className="mb-2 inline-flex items-center justify-center rounded-lg bg-lp-brand-bright p-3 text-lp-on-secondary-container">
                  <Lock className="size-8 shrink-0" aria-hidden />
                </div>
                <h1 className="mb-2 font-heading text-3xl font-bold leading-10 tracking-tight text-lp-cta-bg md:text-4xl md:leading-[40px]">
                  Welcome Back
                </h1>
                <p className="font-sans text-base leading-6 text-lp-on-surface-variant">
                  Enter your credentials to access your dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <LpTextField
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  label="Email Address"
                  placeholder="name@clinic.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isBusy}
                  error={errors.email}
                  startIcon={<Mail className="size-5 shrink-0" aria-hidden />}
                  surface="muted"
                  rounding="lg"
                />

                <LpTextField
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  label="Password"
                  labelEndSlot={
                    <Link
                      href="/forgot-password"
                      className="font-sans text-xs font-semibold uppercase tracking-wide text-lp-brand transition-all hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  }
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

                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isBusy}
                    className="size-4 rounded border-lp-outline-variant text-lp-brand focus:ring-lp-brand"
                  />
                  <label htmlFor="rememberMe" className="ml-2 cursor-pointer font-sans text-sm leading-5 text-lp-on-surface-variant">
                    Remember Me
                  </label>
                </div>

                <LpButton type="submit" variant="primary" fullWidth disabled={isBusy}>
                  {authPhase === "idle" ? (
                    <>
                      <Shield className="size-5 shrink-0" aria-hidden />
                      Log In
                    </>
                  ) : (
                    <>
                      <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
                      {authPhase === "signing-in" ? "Signing you in..." : "Redirecting..."}
                    </>
                  )}
                </LpButton>
              </form>

              <div className="mt-8 text-center">
                <p className="font-sans text-sm leading-5 text-lp-on-surface-variant">
                  New to HealthHere?{" "}
                  <Link href="/register" className="font-bold text-lp-brand transition-all hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-lp-surface" aria-hidden />}>
      <LoginContent />
    </Suspense>
  );
}
