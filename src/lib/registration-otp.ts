import 'server-only'

import crypto from 'crypto'

const OTP_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function getOtpSecret(): string {
  const secret =
    process.env.REGISTRATION_OTP_SECRET ||
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!secret) {
    throw new Error(
      'Missing REGISTRATION_OTP_SECRET. Set a long random string in your environment.',
    )
  }

  return secret
}

export function normalizeRegistrationEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function generateRegistrationOtp(length: number): string {
  const safeLength = Math.min(8, Math.max(4, length))
  const bytes = crypto.randomBytes(safeLength)
  let result = ''

  for (let i = 0; i < safeLength; i++) {
    result += OTP_CHARS[bytes[i]! % OTP_CHARS.length]
  }

  return result
}

export function hashRegistrationOtp(email: string, otp: string): string {
  const normalized = normalizeRegistrationEmail(email)
  const normalizedOtp = otp.trim().toUpperCase()
  return crypto.createHmac('sha256', getOtpSecret()).update(`${normalized}:${normalizedOtp}`).digest('hex')
}

export function isRegistrationOtpFormatValid(otp: string, length: number): boolean {
  const safeLength = Math.min(8, Math.max(4, length))
  const re = new RegExp(`^[A-Z0-9]{${safeLength}}$`)
  return re.test(otp.trim().toUpperCase())
}
