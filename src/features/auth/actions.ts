"use server";

import { getRegistrationSettings } from "@/lib/app-settings";
import {
  REGISTRATION_OTP_EXPIRY_MINUTES,
  REGISTRATION_OTP_LENGTH,
} from "@/lib/registration-constants";

export async function getAuthRegistrationSettings() {
  const settings = await getRegistrationSettings();

  return {
    emailOtpEnabled: settings.email_otp_enabled,
    otpLength: REGISTRATION_OTP_LENGTH,
    otpExpiryMinutes: REGISTRATION_OTP_EXPIRY_MINUTES,
    resendCooldownSeconds: settings.resend_cooldown_seconds,
  };
}
