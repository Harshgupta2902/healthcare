import { z } from 'zod'

export const REGISTRATION_SETTINGS_KEY = 'registration'

export const registrationSettingsSchema = z.object({
  email_otp_enabled: z.boolean().default(false),
  otp_max_attempts: z.number().int().min(3).max(10).default(5),
  resend_cooldown_seconds: z.number().int().min(15).max(300).default(60),
})

export type RegistrationSettings = z.infer<typeof registrationSettingsSchema>

export const DEFAULT_REGISTRATION_SETTINGS: RegistrationSettings = {
  email_otp_enabled: false,
  otp_max_attempts: 5,
  resend_cooldown_seconds: 60,
}

export function parseRegistrationSettings(value: unknown): RegistrationSettings {
  const raw =
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}

  const parsed = registrationSettingsSchema.safeParse({
    email_otp_enabled: raw.email_otp_enabled,
    otp_max_attempts: raw.otp_max_attempts,
    resend_cooldown_seconds: raw.resend_cooldown_seconds,
  })

  if (parsed.success) return parsed.data
  return DEFAULT_REGISTRATION_SETTINGS
}
