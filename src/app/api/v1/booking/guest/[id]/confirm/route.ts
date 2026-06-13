import type { NextRequest } from 'next/server'
import { createApiSupabase } from '@/lib/api/auth'
import { apiError, apiSuccess } from '@/lib/api/response'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = createApiSupabase(_request)

  const { data, error } = await supabase.rpc('get_guest_appointment_confirmation', {
    p_id: id,
  })

  if (error) return apiError(error.message, 400)
  if (!data) return apiError('Booking not found', 404)

  return apiSuccess(data)
}
