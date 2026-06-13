import type { NextRequest } from 'next/server'
import { getAssistantContext } from '@/features/assistant/actions'
import { createApiSupabase, getApiUser } from '@/lib/api/auth'
import { buildAssistantContext } from '@/lib/api/assistant-context'
import { apiError, apiSuccess } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  const supabase = createApiSupabase(request)
  const user = await getApiUser(supabase)

  if (user) {
    const data = await buildAssistantContext(supabase, user)
    return apiSuccess(data)
  }

  const result = await getAssistantContext({})
  if (!result.success) return apiError(result.error, 400)
  return apiSuccess(result)
}
