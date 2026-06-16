import { Suspense } from "react";
import { getRegistrationSettings } from "@/lib/app-settings";
import {
  REGISTRATION_OTP_EXPIRY_MINUTES,
  REGISTRATION_OTP_LENGTH,
} from "@/lib/registration-constants";
import { RegisterContent } from "./RegisterContent";

export default async function Page() {
  const settings = await getRegistrationSettings();

  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-transparent" aria-hidden />}>
      <RegisterContent
        emailOtpEnabled={settings.email_otp_enabled}
        otpLength={REGISTRATION_OTP_LENGTH}
        otpExpiryMinutes={REGISTRATION_OTP_EXPIRY_MINUTES}
        resendCooldownSeconds={settings.resend_cooldown_seconds}
      />
    </Suspense>
  );
}