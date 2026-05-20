import 'server-only'

import { createClient } from '@/lib/supabase/server'

export type NewsletterRateLimitReason = 'ip' | 'email' | 'device'

const LIMITS = {
  ip: { max: 5, windowSeconds: 3600 },
  email: { max: 1, windowSeconds: 900 },
  device: { max: 5, windowSeconds: 3600 },
} as const

const MESSAGES: Record<NewsletterRateLimitReason, string> = {
  ip: 'Too many requests from your network. Please try again later.',
  email: 'Please wait a few minutes before trying this email again.',
  device: 'Too many requests from this device. Please try again later.',
}

function bucketKey(kind: NewsletterRateLimitReason, value: string): string {
  return `${kind}:${value}`
}

async function tryBucket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  kind: NewsletterRateLimitReason,
  value: string,
): Promise<{ allowed: boolean; reason?: NewsletterRateLimitReason }> {
  const { max, windowSeconds } = LIMITS[kind]
  const { data, error } = await supabase.rpc('try_newsletter_rate_limit', {
    p_bucket_key: bucketKey(kind, value),
    p_max_attempts: max,
    p_window_seconds: windowSeconds,
  })

  if (error) {
    console.error(`[newsletter-rate-limit] ${kind} RPC error:`, error)
    return { allowed: false, reason: kind }
  }

  if (data === true) return { allowed: true }
  return { allowed: false, reason: kind }
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

export function newsletterRateLimitMessage(reason: NewsletterRateLimitReason): string {
  return MESSAGES[reason]
}

export async function assertNewsletterRateLimits(input: {
  ip: string
  email: string
  deviceHash?: string | null
}): Promise<{ ok: true } | { ok: false; reason: NewsletterRateLimitReason; error: string }> {
  const supabase = await createClient()
  const normalizedEmail = input.email.trim().toLowerCase()

  const checks: { kind: NewsletterRateLimitReason; value: string }[] = [
    { kind: 'ip', value: input.ip || 'unknown' },
    { kind: 'email', value: normalizedEmail },
  ]

  if (input.deviceHash && /^[a-f0-9]{64}$/i.test(input.deviceHash)) {
    checks.push({ kind: 'device', value: input.deviceHash })
  }

  for (const { kind, value } of checks) {
    const result = await tryBucket(supabase, kind, value)
    if (!result.allowed && result.reason) {
      return {
        ok: false,
        reason: result.reason,
        error: newsletterRateLimitMessage(result.reason),
      }
    }
  }

  return { ok: true }
}