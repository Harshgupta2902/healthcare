"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Loader2,
  User,
  Stethoscope,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "client" | "professional";
  termsAccepted: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const fieldClass =
  "w-full rounded-xl border border-lp-outline-variant bg-white px-4 py-3 font-sans text-base leading-6 text-lp-on-surface outline-none transition-all placeholder:text-lp-on-surface-variant/60 focus:border-lp-brand focus:ring-2 focus:ring-lp-brand/20 disabled:opacity-50 md:text-sm";

const iconInputClass = `${fieldClass} pl-12 pr-4`;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRules = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "client" || roleParam === "professional") {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Required";
    if (!formData.lastName.trim()) newErrors.lastName = "Required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Required";
    } else if (!isPasswordValid) {
      newErrors.password = "Weak password";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.termsAccepted) {
      newErrors.terms = "You must accept the terms to continue";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const next =
      type === "checkbox" ? checked : name === "mobileNumber" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: next,
    }));

    if (name === "termsAccepted") {
      setErrors((prev) => ({ ...prev, terms: undefined }));
    } else if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const messages = Object.values(validationErrors).filter(Boolean) as string[];
      toast.error(messages.join(" • "));
      return;
    }

    setIsLoading(true);

    const fullName = `${formData.firstName} ${formData.lastName}`;

    try {
      const { signUp } = await import("@/features/profile/actions");

      const result = await signUp(formData.email, formData.password, fullName, formData.role);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Account created!");

      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const checklist = [
    { label: "8+ Characters", met: passwordRules.length },
    { label: "Special Character", met: passwordRules.symbol },
    { label: "Uppercase Letter", met: passwordRules.uppercase },
    { label: "One Number", met: passwordRules.number },
    { label: "Lowercase Letter", met: passwordRules.lowercase },
  ];

  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-x-clip">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -right-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-lp-surface-container blur-[120px] opacity-40" />
        <div className="absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-lp-secondary-fixed blur-[120px] opacity-20" />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-16 md:px-0 md:py-24">
        <div className="relative w-full max-w-[560px] rounded-xl border border-[rgba(229,238,255,0.5)] bg-white/80 p-8 shadow-[0px_4px_20px_rgba(10,25,47,0.05)] backdrop-blur-md md:p-12">
          {isLoading && (
            <div
              className="absolute inset-0 z-[80] flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80 px-6 text-center backdrop-blur-sm"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-10 w-10 animate-spin text-lp-brand" />
              <p className="text-xs font-semibold uppercase tracking-widest text-lp-on-surface-variant">Creating your account…</p>
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="mb-2 font-heading text-3xl font-semibold leading-10 tracking-tight text-lp-cta-bg md:text-4xl md:leading-[40px]">
              Create Account
            </h1>
            <p className="font-sans text-base leading-6 text-lp-on-surface-variant">
              {formData.role === "professional"
                ? "Register as a verified healthcare provider"
                : "Join thousands of patients receiving expert care"}
            </p>
          </div>

          <div className="mb-8 flex rounded-xl border border-lp-outline-variant/20 bg-lp-surface-container-low p-1">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: "client" }))}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-3 px-4 font-sans text-sm font-semibold uppercase tracking-wide transition-all",
                formData.role === "client"
                  ? "bg-white text-lp-brand shadow-sm"
                  : "text-lp-on-surface-variant hover:text-lp-brand",
              )}
            >
              <User className="size-5 shrink-0" aria-hidden />
              Patient
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: "professional" }))}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-3 px-4 font-sans text-sm font-semibold uppercase tracking-wide transition-all",
                formData.role === "professional"
                  ? "bg-white text-lp-brand shadow-sm"
                  : "text-lp-on-surface-variant hover:text-lp-brand",
              )}
            >
              <Stethoscope className="size-5 shrink-0" aria-hidden />
              Provider
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block px-1 font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={cn(fieldClass, errors.firstName && "border-red-500 focus:border-red-500 focus:ring-red-500/20")}
                />
                {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block px-1 font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={cn(fieldClass, errors.lastName && "border-red-500 focus:border-red-500 focus:ring-red-500/20")}
                />
                {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="mobileNumber" className="block px-1 font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
                Mobile Number
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lp-on-surface-variant">
                  <Smartphone className="size-5" aria-hidden />
                </span>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={iconInputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block px-1 font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lp-on-surface-variant">
                  <Mail className="size-5" aria-hidden />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={cn(iconInputClass, errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/20")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block px-1 font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
                Create Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lp-on-surface-variant">
                  <Lock className="size-5" aria-hidden />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={cn(
                    iconInputClass,
                    "pr-12",
                    errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lp-on-surface-variant transition-colors hover:text-lp-on-surface disabled:opacity-50"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block px-1 font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
                Confirm Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lp-on-surface-variant">
                  <Lock className="size-5" aria-hidden />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={cn(
                    iconInputClass,
                    "pr-12",
                    errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lp-on-surface-variant transition-colors hover:text-lp-on-surface disabled:opacity-50"
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container p-4">
              <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-wide text-lp-cta-bg">Security Requirements</p>
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {checklist.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 font-sans text-sm text-lp-on-surface-variant">
                    {item.met ? (
                      <CheckCircle2 className="size-[18px] shrink-0 text-lp-brand" aria-hidden />
                    ) : (
                      <Circle className="size-[18px] shrink-0 text-lp-outline-variant" aria-hidden />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleChange}
                disabled={isLoading}
                className="mt-1 size-4 rounded border-lp-outline-variant text-lp-brand focus:ring-lp-brand"
              />
              <label htmlFor="termsAccepted" className="font-sans text-sm leading-relaxed text-lp-on-surface-variant">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="font-medium text-lp-brand hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-lp-brand hover:underline">
                  Privacy Policy
                </Link>{" "}
                including HIPAA compliance.
              </label>
            </div>
            {errors.terms && <p className="text-xs text-red-600">{errors.terms}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-lp-brand to-lp-brand-bright py-4 font-heading text-xl font-semibold leading-8 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:pointer-events-none disabled:opacity-70 md:text-2xl md:leading-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-6 shrink-0 animate-spin" aria-hidden />
                  Creating…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="size-6 shrink-0" aria-hidden />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-lp-outline-variant/30 pt-8 text-center md:hidden">
            <p className="mb-4 font-sans text-base leading-6 text-lp-on-surface-variant">Already have an account?</p>
            <Link
              href="/login"
              className="inline-block rounded-xl border-2 border-lp-brand px-8 py-3 font-sans text-sm font-semibold uppercase tracking-wide text-lp-brand transition-all active:scale-95 hover:bg-lp-surface-container-low"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-transparent" aria-hidden />}>
      <RegisterContent />
    </Suspense>
  );
}
