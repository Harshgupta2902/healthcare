import type { NextRequest } from 'next/server'
import { createApiSupabase, requireApiUser } from '@/lib/api/auth'
import { apiError, apiSuccess } from '@/lib/api/response'
import { syncUserSessionForApi } from '@/lib/api/sync-user-session'

export async function POST(request: NextRequest) {
  const supabase = createApiSupabase(request)
  const user = await requireApiUser(supabase)
  if (!user) return apiError('Unauthorized', 401, 'unauthorized')

  const data = await syncUserSessionForApi(supabase, user)
  if (!data) return apiError('Failed to sync session', 500)

  return apiSuccess(data)
}
