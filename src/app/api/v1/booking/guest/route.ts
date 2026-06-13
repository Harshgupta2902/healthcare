import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { createApiSupabase } from '@/lib/api/auth'
import { apiError, apiSuccess } from '@/lib/api/response'
import {
  assertGuestBookingRateLimits,
  deviceHashZodField,
  getClientIpFromHeaders,
} from '@/lib/device-rate-limit'
import { zodFirstError } from '@/lib/server-action-result'

const guestAppointmentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  age: z.coerce.number().int().min(0).max(120),
  phone: z.string().min(10).max(10),
  email: z.string().email(),
  category: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  message: z.string().optional().nullable(),
  professionalId: z.string().uuid(),
  deviceHash: deviceHashZodField,
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const validated = guestAppointmentSchema.safeParse(body)
  if (!validated.success) {
    return apiError(zodFirstError(validated.error), 400)
  }

  const headerStore = await headers()
  const clientIp = getClientIpFromHeaders(headerStore)
  const rateLimit = await assertGuestBookingRateLimits({
    ip: clientIp,
    deviceHash: validated.data.deviceHash,
    email: validated.data.email,
  })
  if (!rateLimit.ok) {
    return apiError(rateLimit.error, 429, rateLimit.reason)
  }

  const supabase = createApiSupabase(request)
  const { data: { user } } = await supabase.auth.getUser()

  const payload = {
    first_name: validated.data.firstName,
    last_name: validated.data.lastName,
    age: validated.data.age,
    phone: validated.data.phone,
    email: validated.data.email,
    category: validated.data.category,
    state: validated.data.state,
    city: validated.data.city,
    appointment_date: validated.data.date,
    appointment_time: validated.data.time,
    message: validated.data.message ?? null,
    created_by: user?.id ?? null,
    professional_id: validated.data.professionalId,
  }

  const { data, error } = await supabase
    .from('guest_appointments')
    .insert(payload)
    .select('id')
    .single()

  if (error) return apiError(error.message, 400)
  return apiSuccess({ id: data.id })
}
