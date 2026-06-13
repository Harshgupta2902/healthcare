import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createApiSupabase, requireApiUser } from '@/lib/api/auth'
import { apiError, apiSuccess } from '@/lib/api/response'

const bodySchema = z.object({
  guestAppointmentId: z.string().uuid(),
  prescriptionHtml: z.string().min(1).max(200000),
})

export async function POST(request: NextRequest) {
  const supabase = createApiSupabase(request)
  const user = await requireApiUser(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return apiError('Invalid prescription payload', 400)

  const { data: row, error: rowErr } = await supabase
    .from('guest_appointments')
    .select('id, professional_id')
    .eq('id', parsed.data.guestAppointmentId)
    .single()

  if (rowErr || !row) {
    return apiError(rowErr?.message || 'Guest appointment not found', 404)
  }

  if (row.professional_id !== user.id) {
    return apiError('You are not allowed to prescribe for this request', 403)
  }

  const { error } = await supabase
    .from('guest_appointments')
    .update({
      prescription_html: parsed.data.prescriptionHtml,
      prescription_updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.guestAppointmentId)

  if (error) return apiError(error.message, 400)
  return apiSuccess({ ok: true })
}
