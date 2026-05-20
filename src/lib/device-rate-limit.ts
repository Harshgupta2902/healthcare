import 'server-only'

import { createClient } from '@/lib/supabase/server'

/** Same device = same IP + same device fingerprint hash. */
export type DeviceRateLimitReason = 'device' | 'device_minute'

export type DeviceRateLimitScope = 'register' | 'newsletter'

const COMBINED_LIMITS = {
  perMinute: { max: 1, windowSeconds: 60 },
  perHour: { max: 5, windowSeconds: 3600 },
} as const

const DEVICE_HASH_RE = /^[a-f0-9]{64}$/i

const SCOPE_CONFIG: Record<
  DeviceRateLimitScope,
  {
    minutePrefix: string
    hourPrefix: string
    messages: Record<DeviceRateLimitReason, string>
  }
> = {
  register: {
    minutePrefix: 'register_minute',
    hourPrefix: 'register_hour',
    messages: {
      device_minute:
        'You can register only one account per minute from this device. Please wait and try again.',
      device: 'Too many signups from this device. Please try again later.',
    },
  },
  newsletter: {
    minutePrefix: 'newsletter_minute',
    hourPrefix: 'newsletter_hour',
    messages: {
      device_minute:
        'You can subscribe only one email per minute from this device. Please wait and try again.',
      device: 'Too many newsletter signups from this device. Please try again later.',
    },
  },
}

function combinedDeviceBucket(ip: string, deviceHash: string): string {
  return `${ip}|${deviceHash}`
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

async function assertCombinedDeviceRateLimits(
  scope: DeviceRateLimitScope,
  input: { ip: string; deviceHash?: string | null },
): Promise<{ ok: true } | { ok: false; reason: DeviceRateLimitReason; error: string }> {
  const config = SCOPE_CONFIG[scope]
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
    COMBINED_LIMITS.perMinute.max,
    COMBINED_LIMITS.perMinute.windowSeconds,
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
    COMBINED_LIMITS.perHour.max,
    COMBINED_LIMITS.perHour.windowSeconds,
    scope,
  )
  if (!hourOk) {
    return {
      ok: false,
      reason: 'device',
      error: config.messages.device,
    }
  }

  return { ok: true }
}

/** Account registration: 1/min, 5/hour per IP + device. */
export function assertSignupRateLimits(input: {
  ip: string
  deviceHash?: string | null
}) {
  return assertCombinedDeviceRateLimits('register', input)
}

/** Public newsletter subscribe: 1 email/min, 5/hour per IP + device. */
export function assertNewsletterRateLimits(input: {
  ip: string
  deviceHash?: string | null
}) {
  return assertCombinedDeviceRateLimits('newsletter', input)
}
