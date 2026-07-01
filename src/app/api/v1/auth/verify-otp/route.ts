import type { NextRequest } from 'next/server'
import { verifyOtpAndSignUp } from '@/features/profile/actions'
import { apiError, apiSuccess } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return apiError('Invalid JSON body', 400)

  const { email, password, deviceHash, otp, name, role, nameTitle } = body as {
    email?: string
    password?: string
    deviceHash?: string
    otp?: string
    name?: string
    role?: string
    nameTitle?: string | null
  }

  const result = await verifyOtpAndSignUp({
    email: email ?? '',
    password: password ?? '',
    name: name ?? '',
    role: (role as 'client' | 'professional') ?? 'client',
    deviceHash: deviceHash ?? '',
    otp: otp ?? '',
    nameTitle: nameTitle ?? null,
  })

  if ('error' in result && result.error) {
    return apiError(result.error, 400, result.code)
  }

  return apiSuccess({ ok: true })
}
