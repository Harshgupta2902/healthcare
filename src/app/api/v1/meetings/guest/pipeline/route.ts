import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createApiSupabase, requireApiUser } from '@/lib/api/auth'
import { apiError, apiSuccess } from '@/lib/api/response'
import { createConsultationMeeting } from '@/lib/calendar/createConsultationMeeting'
import {
  loadGuestMeetingContext,
  saveGuestMeetingUrl,
} from '@/lib/calendar/guestMeetingPipeline'

const bodySchema = z.object({
  guestAppointmentId: z.string().uuid(),
})

async function assertGuestMeetingAccess(
  supabase: ReturnType<typeof createApiSupabase>,
  guestAppointmentId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from('guest_appointments')
    .select('created_by, professional_id')
    .eq('id', guestAppointmentId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Appointment not found.')

  const allowed =
    data.created_by === userId || data.professional_id === userId

  if (!allowed) throw new Error('You do not have access to this booking.')
}

export async function POST(request: NextRequest) {
  const supabase = createApiSupabase(request)
  const user = await requireApiUser(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return apiError('Invalid guestAppointmentId', 400)

  try {
    await assertGuestMeetingAccess(supabase, parsed.data.guestAppointmentId, user.id)
    const ctx = await loadGuestMeetingContext(supabase, parsed.data.guestAppointmentId)
    const result = await createConsultationMeeting(ctx)
    await saveGuestMeetingUrl(supabase, parsed.data.guestAppointmentId, result.meetUrl)
    return apiSuccess(result)
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Meeting pipeline failed', 400)
  }
}
