import type { NextRequest } from 'next/server'
import { submitContactForm } from '@/features/contact/actions'
import { apiError, apiSuccess } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return apiError('Invalid JSON body', 400)

  const result = await submitContactForm(body)
  if (result.error) {
    const message = typeof result.error === 'string'
      ? result.error
      : 'Validation failed'
    return apiError(message, 400, result.code)
  }

  return apiSuccess({ ok: true })
}
