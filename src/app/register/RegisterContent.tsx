"use client";

import { useState, useEffect, useCallback } from "react";
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
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { LpButton } from "@/components/ui/lp-button";
import { LpTextField } from "@/components/ui/lp-text-field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { getDeviceFingerprintHash } from "@/lib/device-fingerprint";

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
  otp?: string;
}

type RegisterPhase = "idle" | "sending-otp" | "verifying-otp" | "creating-account" | "redirecting";

const LOADING_MESSAGES: Record<Exclude<RegisterPhase, "idle">, string> = {
  "sending-otp": "Sending verification code…",
  "verifying-otp": "Verifying your code…",
  "creating-account": "Creating your account…",
  redirecting: "Taking you to dashboard…",
};

export type RegisterContentProps = {
  emailOtpEnabled: boolean;
  otpLength: number;
  otpExpiryMinutes: number;
  resendCooldownSeconds: number;
};

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${local.length > 2 ? "***" : ""}@${domain}`;
}

export function RegisterContent({
  emailOtpEnabled,
  otpLength,
  otpExpiryMinutes,
  resendCooldownSeconds,
}: RegisterContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"form" | "otp">("form");
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
  const [registerPhase, setRegisterPhase] = useState<RegisterPhase>("idle");
  const isBusy = registerPhase !== "idle";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

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

  const buildSignUpPayload = useCallback(async () => {
    const deviceHash = await getDeviceFingerprintHash();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    return {
      email: formData.email.trim(),
      password: formData.password,
      name: fullName,
      role: formData.role,
      deviceHash,
    };
  }, [formData]);

  const sendOtp = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const messages = Object.values(validationErrors).filter(Boolean) as string[];
      toast.error(messages.join(" • "));
      return false;
    }

    setRegisterPhase("sending-otp");
    try {
      const { requestRegistrationOtp } = await import("@/features/profile/actions");
      const result = await requestRegistrationOtp(await buildSignUpPayload());

      if ("error" in result && result.error) {
        toast.error(result.error);
        setRegisterPhase("idle");
        return false;
      }

      toast.success(`Verification code sent to ${maskEmail(formData.email)}`);
      setResendCooldown(result.resendCooldownSeconds ?? resendCooldownSeconds);
      setOtp("");
      setStep("otp");
      setRegisterPhase("idle");
      return true;
    } catch {
      toast.error("Something went wrong");
      setRegisterPhase("idle");
      return false;
    }
  };

  const completeDirectSignUp = async () => {
    setRegisterPhase("creating-account");
    try {
      const { signUp } = await import("@/features/profile/actions");
      const result = await signUp(await buildSignUpPayload());

      if ("error" in result && result.error) {
        toast.error(result.error);
        setRegisterPhase("idle");
        return;
      }

      toast.success("Account created!");
      setRegisterPhase("redirecting");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
      setRegisterPhase("idle");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailOtpEnabled) {
      await sendOtp();
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const messages = Object.values(validationErrors).filter(Boolean) as string[];
      toast.error(messages.join(" • "));
      return;
    }

    await completeDirectSignUp();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== otpLength) {
      setErrors((prev) => ({
        ...prev,
        otp: `Enter the ${otpLength}-character code from your email`,
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, otp: undefined }));
    setRegisterPhase("verifying-otp");

    try {
      const { verifyOtpAndSignUp } = await import("@/features/profile/actions");
      const payload = await buildSignUpPayload();
      const result = await verifyOtpAndSignUp({ ...payload, otp });

      if ("error" in result && result.error) {
        toast.error(result.error);
        if (result.code === "expired" || result.code === "locked") {
          setOtp("");
        }
        setRegisterPhase("idle");
        return;
      }

      toast.success("Account created!");
      setRegisterPhase("redirecting");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
      setRegisterPhase("idle");
    }
  };

  const checklist = [
    { label: "8+ Characters", met: passwordRules.length },
    { label: "Special Character", met: passwordRules.symbol },
    { label: "Uppercase Letter", met: passwordRules.uppercase },
    { label: "One Number", met: passwordRules.number },
    { label: "Lowercase Letter", met: passwordRules.lowercase },
  ];

  const loadingLabel = registerPhase !== "idle" ? LOADING_MESSAGES[registerPhase] : "";

  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-x-clip">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -right-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-lp-surface-container blur-[120px] opacity-40" />
        <div className="absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-lp-secondary-fixed blur-[120px] opacity-20" />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-16 md:px-0 md:py-24">
        <div className="relative w-full max-w-[560px] rounded-xl border border-[rgba(229,238,255,0.5)] bg-white/80 p-8 shadow-[0px_4px_20px_rgba(10,25,47,0.05)] backdrop-blur-md md:p-12">
          {isBusy && (
            <div
              className="absolute inset-0 z-[80] flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80 px-6 text-center backdrop-blur-sm"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-10 w-10 shrink-0 animate-spin text-lp-brand" />
              <p className="text-xs font-semibold uppercase tracking-widest text-lp-on-surface-variant">
                {loadingLabel}
              </p>
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="mb-2 font-heading text-3xl font-semibold leading-10 tracking-tight text-lp-cta-bg md:text-4xl md:leading-[40px]">
              {step === "otp" ? "Verify your email" : "Create Account"}
            </h1>
            <p className="font-sans text-base leading-6 text-lp-on-surface-variant">
              {step === "otp" ? (
                <>
                  Enter the {otpLength}-character code sent to{" "}
                  <span className="font-medium text-lp-on-surface">{maskEmail(formData.email)}</span>. It expires in{" "}
                  {otpExpiryMinutes} minutes.
                </>
              ) : formData.role === "professional" ? (
                "Register as a verified healthcare provider"
              ) : (
                "Join thousands of patients receiving expert care"
              )}
            </p>
          </div>

          {step === "form" ? (
            <>
              <div className="mb-8 flex rounded-xl border border-lp-outline-variant/20 bg-lp-surface-container-low p-1">
                <LpButton
                  type="button"
                  variant={formData.role === "client" ? "segmentOn" : "segmentOff"}
                  onClick={() => setFormData((p) => ({ ...p, role: "client" }))}
                  disabled={isBusy}
                  className="gap-2"
                >
                  <User className="size-5 shrink-0" aria-hidden />
                  Patient
                </LpButton>
                <LpButton
                  type="button"
                  variant={formData.role === "professional" ? "segmentOn" : "segmentOff"}
                  onClick={() => setFormData((p) => ({ ...p, role: "professional" }))}
                  disabled={isBusy}
                  className="gap-2"
                >
                  <Stethoscope className="size-5 shrink-0" aria-hidden />
                  Provider
                </LpButton>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <LpTextField
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isBusy}
                    error={errors.firstName}
                  />
                  <LpTextField
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isBusy}
                    error={errors.lastName}
                  />
                </div>

                <LpTextField
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  label="Mobile Number"
                  placeholder="+1 (555) 000-0000"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  disabled={isBusy}
                  startIcon={<Smartphone className="size-5" aria-hidden />}
                />

                <LpTextField
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  label="Email Address"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isBusy}
                  error={errors.email}
                  startIcon={<Mail className="size-5" aria-hidden />}
                />

                <LpTextField
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  label="Create Password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isBusy}
                  error={errors.password}
                  startIcon={<Lock className="size-5" aria-hidden />}
                  endSlot={
                    <LpButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={isBusy}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </LpButton>
                  }
                />

                <LpTextField
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  label="Confirm Password"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isBusy}
                  error={errors.confirmPassword}
                  startIcon={<Lock className="size-5" aria-hidden />}
                />

                <div className="rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container p-4">
                  <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-wide text-lp-cta-bg">
                    Security Requirements
                  </p>
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
                    disabled={isBusy}
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

                <LpButton type="submit" variant="primary" fullWidth disabled={isBusy}>
                  {isBusy ? (
                    <>
                      <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
                      {emailOtpEnabled ? "Sending code…" : "Creating…"}
                    </>
                  ) : (
                    <>
                      {emailOtpEnabled ? "Send verification code" : "Create Account"}
                      <ArrowRight className="size-5 shrink-0" aria-hidden />
                    </>
                  )}
                </LpButton>
              </form>
            </>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <InputOTP
                  maxLength={otpLength}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value.toUpperCase());
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                  }}
                  disabled={isBusy}
                >
                  <InputOTPGroup>
                    {Array.from({ length: otpLength }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} className="h-12 w-11 text-base font-semibold" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {errors.otp ? <p className="text-sm text-red-600">{errors.otp}</p> : null}
              </div>

              <div className="space-y-3">
                <LpButton type="submit" variant="primary" fullWidth disabled={isBusy || otp.length !== otpLength}>
                  {isBusy ? (
                    <>
                      <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
                      Verifying…
                    </>
                  ) : (
                    <>
                      Verify &amp; create account
                      <ArrowRight className="size-5 shrink-0" aria-hidden />
                    </>
                  )}
                </LpButton>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <LpButton
                    type="button"
                    variant="ghost"
                    className="gap-2"
                    disabled={isBusy}
                    onClick={() => {
                      setStep("form");
                      setOtp("");
                    }}
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    Back to form
                  </LpButton>

                  <LpButton
                    type="button"
                    variant="outline"
                    disabled={isBusy || resendCooldown > 0}
                    onClick={() => void sendOtp()}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </LpButton>
                </div>
              </div>
            </form>
          )}

          <div className="mt-8 border-t border-lp-outline-variant/30 pt-8 text-center md:hidden">
            <p className="mb-4 font-sans text-base leading-6 text-lp-on-surface-variant">Already have an account?</p>
            <div className="flex justify-center">
              <LpButton asChild variant="outline">
                <Link href="/login">Login</Link>
              </LpButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
