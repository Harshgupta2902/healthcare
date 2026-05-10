import 'server-only'

import crypto from 'crypto'

/**
 * Stateless, signed unsubscribe tokens for newsletter emails.
 *
 * Format:  base64url(email) + "." + base64url(hmac_sha256(email, SECRET))
 *
 * No DB lookup required — verifying the HMAC proves the token was issued by us.
 * Tokens never expire (unsubscribe links should keep working).
 *
 * Required env:
 *   NEWSLETTER_UNSUBSCRIBE_SECRET   long random string used as the HMAC key
 */

function getSecret(): string {
    const secret =
        process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ||
        // Fallback so dev never crashes; production MUST set the env var.
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!secret) {
        throw new Error(
            'Missing NEWSLETTER_UNSUBSCRIBE_SECRET. Set a long random string in your environment.'
        )
    }
    return secret
}

function b64urlEncode(input: string | Buffer): string {
    return Buffer.from(input)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

function b64urlDecode(input: string): string {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(
        Math.ceil(input.length / 4) * 4,
        '='
    )
    return Buffer.from(padded, 'base64').toString('utf8')
}

function sign(payload: string): string {
    return crypto
        .createHmac('sha256', getSecret())
        .update(payload)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

export function createUnsubscribeToken(email: string): string {
    const normalized = email.trim().toLowerCase()
    const payload = b64urlEncode(normalized)
    const sig = sign(normalized)
    return `${payload}.${sig}`
}

export type VerifiedUnsubscribeToken =
    | { ok: true; email: string }
    | { ok: false; error: string }

export function verifyUnsubscribeToken(token: string): VerifiedUnsubscribeToken {
    try {
        if (!token || typeof token !== 'string' || !token.includes('.')) {
            return { ok: false, error: 'Invalid unsubscribe link.' }
        }

        const [payload, sig] = token.split('.')
        if (!payload || !sig) {
            return { ok: false, error: 'Invalid unsubscribe link.' }
        }

        const email = b64urlDecode(payload).toLowerCase()
        const expected = sign(email)

        // timing-safe compare to prevent token-guessing attacks
        const a = Buffer.from(sig)
        const b = Buffer.from(expected)
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            return { ok: false, error: 'This unsubscribe link is invalid or has been tampered with.' }
        }

        return { ok: true, email }
    } catch {
        return { ok: false, error: 'Could not read unsubscribe link.' }
    }
}
