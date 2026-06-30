"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  email: string;
  password: string;
  role: "client" | "professional";
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  otp?: string;
}

type RegisterPhase = "idle" | "sending-otp" | "verifying-otp" | "creating-account" | "redirecting";

const LOADING_MESSAGES: Record<Exclude<RegisterPhase, "idle">, string> = {
  "sending-otp": "Sending verification code…",
  "verifying-otp": "Verifying your code…",
  "creating-account": "Creating your account…",
  redirecting: "Taking you to dashboard…",
};

export type AuthRegisterFormProps = {
  emailOtpEnabled: boolean;
  otpLength: number;
  otpExpiryMinutes: number;
  resendCooldownSeconds: number;
  redirectPath?: string | null;
  defaultRole?: "client" | "professional";
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onProcessingChange?: (processing: boolean) => void;
};

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${local.length > 2 ? "***" : ""}@${domain}`;
}

export function AuthRegisterForm({
  emailOtpEnabled,
  otpLength,
  otpExpiryMinutes,
  resendCooldownSeconds,
  redirectPath = null,
  defaultRole,
  onSuccess,
  onSwitchToLogin,
  onProcessingChange,
}: AuthRegisterFormProps) {
  const router = useRouter();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: defaultRole ?? "client",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [registerPhase, setRegisterPhase] = useState<RegisterPhase>("idle");
  const isBusy = registerPhase !== "idle";
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    onProcessingChange?.(isBusy);
  }, [isBusy, onProcessingChange]);

  const passwordRules = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    if (defaultRole) {
      setFormData((prev) => ({ ...prev, role: defaultRole }));
    }
  }, [defaultRole]);

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

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
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
      onSuccess?.();
      router.push(redirectPath ?? "/dashboard");
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
      onSuccess?.();
      router.push(redirectPath ?? "/dashboard");
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
    <div className="relative w-full">
          {isBusy && (
            <div
              className="absolute inset-0 z-[80] flex flex-col items-center justify-center gap-3 rounded-xl bg-white/95 px-6 text-center"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-10 w-10 shrink-0 animate-spin text-lp-brand" />
              <p className="text-xs font-semibold uppercase tracking-widest text-lp-on-surface-variant">
                {loadingLabel}
              </p>
            </div>
          )}

          {step === "otp" ? (
            <div className="mb-6">
              <p className="font-sans text-sm leading-6 text-lp-on-surface-variant">
                Enter the {otpLength}-character code sent to{" "}
                <span className="font-medium text-lp-on-surface">{maskEmail(formData.email)}</span>. It expires in{" "}
                {otpExpiryMinutes} minutes.
              </p>
            </div>
          ) : null}

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

                {formData.password.length > 0 ? (
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
                ) : null}

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

              <p className="mt-5 rounded-xl border border-lp-outline-variant/25 bg-lp-surface-container-low px-4 py-3 text-center font-sans text-xs leading-relaxed text-lp-on-surface-variant">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="font-semibold text-lp-brand hover:underline">
                  Terms of Service
                </Link>
                ,{" "}
                <Link href="/privacy" className="font-semibold text-lp-brand hover:underline">
                  Privacy Policy
                </Link>
                , and HIPAA compliance guidelines.
              </p>
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

          {onSwitchToLogin ? (
            <div className="mt-6 text-center">
              <p className="font-sans text-sm leading-5 text-lp-on-surface-variant">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  disabled={isBusy}
                  className="font-bold text-lp-brand transition-all hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  Sign In
                </button>
              </p>
            </div>
          ) : null}
        </div>
  );
}
