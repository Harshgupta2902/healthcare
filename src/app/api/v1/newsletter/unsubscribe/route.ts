import type { NextRequest } from 'next/server'
import { unsubscribeNewsletter } from '@/features/client/actions'
import { apiError, apiSuccess } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const token = body?.token as string | undefined
  if (!token) return apiError('Token is required', 400)

  const result = await unsubscribeNewsletter(token)
  if (!result.success) return apiError(result.error, 400)

  return apiSuccess({ email: result.email })
}
