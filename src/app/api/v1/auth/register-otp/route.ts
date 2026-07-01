import type { NextRequest } from 'next/server'
import { requestRegistrationOtp } from '@/features/profile/actions'
import { apiError, apiSuccess } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return apiError('Invalid JSON body', 400)

  const result = await requestRegistrationOtp(body)
  if ('error' in result && result.error) {
    return apiError(result.error, 400, result.code)
  }

  return apiSuccess({
    expiresInMinutes: result.expiresInMinutes,
    otpLength: result.otpLength,
    resendCooldownSeconds: result.resendCooldownSeconds,
  })
}
