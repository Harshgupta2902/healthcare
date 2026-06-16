import 'server-only'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/** Same device = same client IP + same device fingerprint hash. */
export type DeviceRateLimitReason =
  | 'device'
  | 'device_minute'
  | 'email'
  | 'email_hour'
  | 'email_day'

export type DeviceRateLimitScope =
  | 'register'
  | 'register_otp'
  | 'newsletter'
  | 'login'
  | 'contact'
  | 'guest_booking'

const DEVICE_HASH_RE = /^[a-f0-9]{64}$/i

type LimitWindow = { max: number; windowSeconds: number }

type ScopeLimitConfig = {
  perMinute: LimitWindow
  perHour: LimitWindow
  /** Per normalized email (hour window). */
  perEmailHour?: LimitWindow
  /** Per normalized email (day window) — registration only. */
  perEmailDay?: LimitWindow
  minutePrefix: string
  hourPrefix: string
  emailHourPrefix?: string
  emailDayPrefix?: string
  messages: {
    device_minute: string
    device: string
    email_hour?: string
    email_day?: string
  }
}

const SCOPE_LIMITS: Record<DeviceRateLimitScope, ScopeLimitConfig> = {
  register: {
    perMinute: { max: 1, windowSeconds: 60 },
    perHour: { max: 5, windowSeconds: 3600 },
    perEmailDay: { max: 3, windowSeconds: 86400 },
    minutePrefix: 'register_minute',
    hourPrefix: 'register_hour',
    emailDayPrefix: 'register_email_day',
    messages: {
      device_minute:
        'You can register only one account per minute from this device. Please wait and try again.',
      device: 'Too many signups from this device. Please try again later.',
      email_day: 'Too many registration attempts for this email today. Please try again tomorrow.',
    },
  },
  register_otp: {
    perMinute: { max: 1, windowSeconds: 60 },
    perHour: { max: 5, windowSeconds: 3600 },
    perEmailHour: { max: 3, windowSeconds: 3600 },
    minutePrefix: 'register_otp_minute',
    hourPrefix: 'register_otp_hour',
    emailHourPrefix: 'register_otp_email_hour',
    messages: {
      device_minute: 'Please wait a minute before requesting another verification code.',
      device: 'Too many verification code requests from this device. Please try again later.',
      email_hour: 'Too many verification codes sent to this email. Please try again later.',
    },
  },
  newsletter: {
    perMinute: { max: 1, windowSeconds: 60 },
    perHour: { max: 5, windowSeconds: 3600 },
    perEmailHour: { max: 3, windowSeconds: 3600 },
    minutePrefix: 'newsletter_minute',
    hourPrefix: 'newsletter_hour',
    emailHourPrefix: 'newsletter_email_hour',
    messages: {
      device_minute:
        'You can subscribe only one email per minute from this device. Please wait and try again.',
      device: 'Too many newsletter signups from this device. Please try again later.',
      email_hour: 'Too many attempts for this email. Please try again later.',
    },
  },
  login: {
    perMinute: { max: 5, windowSeconds: 60 },
    perHour: { max: 20, windowSeconds: 3600 },
    perEmailHour: { max: 10, windowSeconds: 3600 },
    minutePrefix: 'login_minute',
    hourPrefix: 'login_hour',
    emailHourPrefix: 'login_email_hour',
    messages: {
      device_minute: 'Too many login attempts. Please wait a minute and try again.',
      device: 'Too many login attempts from this device. Please try again later.',
      email_hour: 'Too many login attempts for this email. Please try again later.',
    },
  },
  contact: {
    perMinute: { max: 2, windowSeconds: 60 },
    perHour: { max: 10, windowSeconds: 3600 },
    perEmailHour: { max: 5, windowSeconds: 3600 },
    minutePrefix: 'contact_minute',
    hourPrefix: 'contact_hour',
    emailHourPrefix: 'contact_email_hour',
    messages: {
      device_minute:
        'You can send only a few messages per minute from this device. Please wait and try again.',
      device: 'Too many contact messages from this device. Please try again later.',
      email_hour: 'Too many messages from this email address. Please try again later.',
    },
  },
  guest_booking: {
    perMinute: { max: 2, windowSeconds: 60 },
    perHour: { max: 10, windowSeconds: 3600 },
    perEmailHour: { max: 5, windowSeconds: 3600 },
    minutePrefix: 'guest_booking_minute',
    hourPrefix: 'guest_booking_hour',
    emailHourPrefix: 'guest_booking_email_hour',
    messages: {
      device_minute:
        'You can submit only a few bookings per minute from this device. Please wait and try again.',
      device: 'Too many booking attempts from this device. Please try again later.',
      email_hour: 'Too many booking attempts for this email. Please try again later.',
    },
  },
}

function combinedDeviceBucket(ip: string, deviceHash: string): string {
  return `${ip}|${deviceHash}`
}

function normalizeEmailForBucket(email: string): string {
  return email.trim().toLowerCase().slice(0, 320)
}

async function tryBucket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucketKey: string,
  max: number,
  windowSeconds: number,
  scope: DeviceRateLimitScope,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('try_newsletter_rate_limit', {
    p_bucket_key: bucketKey,
    p_max_attempts: max,
    p_window_seconds: windowSeconds,
  })

  if (error) {
    console.error(`[device-rate-limit:${scope}] RPC error:`, error, bucketKey)
    return false
  }

  return data === true
}

export function getClientIpFromHeaders(headerStore: Headers): string {
  const forwarded = headerStore.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first.slice(0, 128)
  }
  const realIp = headerStore.get('x-real-ip')?.trim()
  if (realIp) return realIp.slice(0, 128)
  return 'unknown'
}

export type RateLimitInput = {
  ip: string
  deviceHash?: string | null
  email?: string | null
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: DeviceRateLimitReason; error: string }

async function assertScopeRateLimits(
  scope: DeviceRateLimitScope,
  input: RateLimitInput,
): Promise<RateLimitResult> {
  const config = SCOPE_LIMITS[scope]
  const deviceHash = input.deviceHash?.trim()

  if (!deviceHash || !DEVICE_HASH_RE.test(deviceHash)) {
    return {
      ok: false,
      reason: 'device',
      error: 'Unable to verify your device. Please refresh the page and try again.',
    }
  }

  const supabase = await createClient()
  const ip = input.ip || 'unknown'
  const combined = combinedDeviceBucket(ip, deviceHash)

  const minuteOk = await tryBucket(
    supabase,
    `${config.minutePrefix}:${combined}`,
    config.perMinute.max,
    config.perMinute.windowSeconds,
    scope,
  )
  if (!minuteOk) {
    return {
      ok: false,
      reason: 'device_minute',
      error: config.messages.device_minute,
    }
  }

  const hourOk = await tryBucket(
    supabase,
    `${config.hourPrefix}:${combined}`,
    config.perHour.max,
    config.perHour.windowSeconds,
    scope,
  )
  if (!hourOk) {
    return {
      ok: false,
      reason: 'device',
      error: config.messages.device,
    }
  }

  const email = input.email?.trim()
  if (email && config.perEmailHour && config.emailHourPrefix) {
    const normalized = normalizeEmailForBucket(email)
    if (normalized.length >= 3) {
      const emailHourOk = await tryBucket(
        supabase,
        `${config.emailHourPrefix}:${normalized}`,
        config.perEmailHour.max,
        config.perEmailHour.windowSeconds,
        scope,
      )
      if (!emailHourOk) {
        return {
          ok: false,
          reason: 'email_hour',
          error: config.messages.email_hour ?? config.messages.device,
        }
      }
    }
  }

  if (email && config.perEmailDay && config.emailDayPrefix) {
    const normalized = normalizeEmailForBucket(email)
    if (normalized.length >= 3) {
      const emailDayOk = await tryBucket(
        supabase,
        `${config.emailDayPrefix}:${normalized}`,
        config.perEmailDay.max,
        config.perEmailDay.windowSeconds,
        scope,
      )
      if (!emailDayOk) {
        return {
          ok: false,
          reason: 'email_day',
          error: config.messages.email_day ?? config.messages.device,
        }
      }
    }
  }

  return { ok: true }
}

/** Account registration: 1/min, 5/hour per IP+device; 3/day per email. */
export function assertSignupRateLimits(input: RateLimitInput) {
  return assertScopeRateLimits('register', input)
}

/** Registration OTP resend: 1/min, 5/hour per IP+device; 3/hour per email. */
export function assertRegisterOtpRateLimits(input: RateLimitInput) {
  return assertScopeRateLimits('register_otp', input)
}

/** Public newsletter subscribe: 1/min, 5/hour per IP+device; 3/hour per email. */
export function assertNewsletterRateLimits(input: RateLimitInput) {
  return assertScopeRateLimits('newsletter', input)
}

/** Login: 5/min, 20/hour per IP+device; 10/hour per email. */
export function assertLoginRateLimits(input: RateLimitInput) {
  return assertScopeRateLimits('login', input)
}

/** Contact form: 2/min, 10/hour per IP+device; 5/hour per email. */
export function assertContactRateLimits(input: RateLimitInput) {
  return assertScopeRateLimits('contact', input)
}

/** Guest consultation booking: 2/min, 10/hour per IP+device; 5/hour per email. */
export function assertGuestBookingRateLimits(input: RateLimitInput) {
  return assertScopeRateLimits('guest_booking', input)
}

export const DEVICE_HASH_ZOD_MESSAGE =
  'Unable to verify your device. Please refresh the page and try again.'

/** Zod field for browser device fingerprint (64-char SHA-256 hex). */
export const deviceHashZodField = z
  .string()
  .regex(DEVICE_HASH_RE, DEVICE_HASH_ZOD_MESSAGE)
