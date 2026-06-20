'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { zodFirstError } from '@/lib/server-action-result'
import {
  parseRegistrationSettings,
  REGISTRATION_SETTINGS_KEY,
  registrationSettingsSchema,
  type RegistrationSettings,
} from '@/lib/registration-settings'
import {
  BOOKING_SETTINGS_KEY,
  bookingSettingsSchema,
  parseBookingSettings,
  type BookingSettings,
} from '@/lib/booking-settings'
import { isValidHourlyAvailabilityWindow } from '@/lib/booking/slots'
import { normalizeAvailabilityTime } from '@/lib/booking/timezone'

// ============================================
// SCHEMAS
// ============================================

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['client', 'professional', 'admin']),
  phone: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
})

const professionalSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  specialization: z.string().min(1, 'Specialization is required'),
  license_number: z.string().min(1, 'License number is required'),
  bio: z.string().optional().nullable(),
  years_of_experience: z.number().int().min(0).optional().nullable(),
  consultation_fee: z.number().int().min(0).optional().nullable(),
  is_verified: z.boolean().default(false),
  city: z.string().optional().nullable(),
})

const appointmentSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  professional_id: z.string().uuid('Invalid professional ID'),
  appointment_type: z.string().min(1, 'Appointment type is required'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  start_time: z.string().datetime('Invalid start time'),
  end_time: z.string().datetime('Invalid end time'),
  notes: z.string().optional().nullable(),
  meeting_url: z.string().optional().nullable(),
})

const medicalHistorySchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  condition_name: z.string().min(1, 'Condition name is required'),
  diagnosis_date: z.string().optional().nullable(),
  status: z.string().default('active'),
  notes: z.string().optional().nullable(),
})

const medicationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  medication_name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
  prescribing_doctor: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

const documentSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  document_name: z.string().min(1, 'Document name is required'),
  document_type: z.string().min(1, 'Document type is required'),
  file_url: z.string().url('Invalid file URL'),
  file_size: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
})

const insuranceSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  provider_name: z.string().min(1, 'Provider name is required'),
  policy_number: z.string().min(1, 'Policy number is required'),
  group_number: z.string().optional().nullable(),
  policy_holder_name: z.string().min(1, 'Policy holder name is required'),
  relationship_to_holder: z.string().optional().nullable(),
  expiration_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

const newsletterSchema = z.object({
  email: z.string().email('Invalid email'),
  status: z.enum(['active', 'resubscribed', 'unsubscribed']).default('active'),
})

const newsletterBroadcastSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(300),
  htmlBody: z.string().min(1, 'Content is required').max(800_000),
})

const guestAppointmentProfessionalSchema = z.object({
  guestAppointmentId: z.string().uuid('Invalid guest appointment id'),
  professionalId: z.union([z.string().uuid('Invalid professional id'), z.null()]),
})

const guestCalendarInviteSchema = z.object({
  guestAppointmentId: z.string().uuid('Invalid guest appointment id'),
  url: z.string().url('Invalid URL').max(4000),
})

const guestMeetingCreateSchema = z.object({
  guestAppointmentId: z.string().uuid('Invalid guest appointment id'),
})

const guestMeetingStepIdSchema = z.object({
  guestAppointmentId: z.string().uuid('Invalid guest appointment id'),
})

const guestMeetingPersistSchema = guestMeetingStepIdSchema.extend({
  meetUrl: z.string().url('Invalid meeting URL').max(4000),
  provider: z.enum(['google', 'jitsi']),
})

/** Guest row for admin list + merged `users` row for `professional_id`. */
export type GuestAppointmentAdminRow = {
  id: string
  first_name: string
  last_name: string
  age: number
  phone: string
  email: string
  category: string
  state: string
  city: string
  appointment_date: string
  appointment_time: string
  message: string | null
  created_at: string
  created_by: string | null
  professional_id: string | null
  professional: { id: string; name: string | null; email: string } | null
  calendar_invite_url?: string | null
}

// ============================================
// HELPER: Admin session (never throws — returns message for clients in production)
// ============================================

export async function requireAdmin(): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'You must be signed in.' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    return { ok: false, error: 'Admin access is required.' }
  }

  return { ok: true }
}

// ============================================
// USERS CRUD
// ============================================

export async function getUsers(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  // Clients only: admins never listed; professionals are managed on /application/enter/professionals
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: data || [], count: count || 0 }
}

export async function createUser(data: z.infer<typeof userSchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = userSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('users')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/users')
  return { success: true as const, data: result }
}

export async function updateUser(id: string, data: Partial<z.infer<typeof userSchema>>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = userSchema.partial().safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('users')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/users')
  return { success: true as const, data: result }
}

export async function deleteUser(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (currentUser?.id === id) {
    return { success: false as const, error: 'You cannot delete your own account.' }
  }

  const { error } = await supabase.rpc('delete_user_account', { p_user_id: id })
  if (error) return { success: false as const, error: error.message }

  revalidatePath('/application/enter/users')
  revalidatePath('/application/enter/professionals')
  revalidatePath('/consultants', 'layout')
  return { success: true as const }
}

// ============================================
// PROFESSIONALS CRUD
// ============================================

export async function getProfessionals(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  // Two-step load: nested embed can fail if FK hint / optional columns differ per DB.
  // Users with role professional always list here; profiles loaded separately.
  let usersQuery = supabase
    .from('users')
    .select('id, name, email, phone, phone_country_code, image, created_at', { count: 'exact' })
    .eq('role', 'professional')
    .order('created_at', { ascending: false })

  const rawSearch = search?.trim() ?? ''
  if (rawSearch) {
    const escaped = rawSearch.replace(/[%]/g, '').replace(/,/g, ' ').trim()
    if (escaped) {
      const term = `%${escaped}%`
      usersQuery = usersQuery.or(`name.ilike.${term},email.ilike.${term}`)
    }
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: userRows, error, count } = await usersQuery.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }

  const users = userRows || []
  const userIds = users.map((u) => u.id)

  const profileMap = new Map<string, Record<string, unknown>>()
  if (userIds.length > 0) {
    const { data: profiles, error: profErr } = await supabase
      .from('professional_profiles')
      .select('*')
      .in('user_id', userIds)

    if (profErr) {
      console.error('getProfessionals: professional_profiles load failed', profErr.message)
    } else {
      for (const p of profiles || []) {
        profileMap.set(p.user_id as string, p as Record<string, unknown>)
      }
    }
  }

  const rows = users.map((u) => {
    const prof = profileMap.get(u.id)
    return {
      id: (prof?.id as string | undefined) ?? '',
      user_id: u.id,
      name: u.name as string | null,
      email: u.email as string,
      phone: (u.phone as string | null) ?? null,
      phone_country_code: (u.phone_country_code as string | null) ?? null,
      image: (u.image as string | null) ?? null,
      specialization: (prof?.specialization as string | undefined) ?? '',
      license_number: (prof?.license_number as string | undefined) ?? '',
      bio: (prof?.bio as string | null | undefined) ?? null,
      years_of_experience: (prof?.years_of_experience as number | null | undefined) ?? null,
      consultation_fee: (prof?.consultation_fee as number | null | undefined) ?? null,
      is_verified: Boolean(prof?.is_verified),
      city: (prof?.city as string | null | undefined) ?? null,
      created_at: (prof?.created_at as string | undefined) ?? (u.created_at as string),
    }
  })

  return { success: true as const, data: rows, count: count || 0 }
}

export async function createProfessional(data: z.infer<typeof professionalSchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = professionalSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('professional_profiles')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/professionals')
  revalidatePath('/consultants', 'layout')
  return { success: true as const, data: result }
}

export async function updateProfessional(id: string, data: Partial<z.infer<typeof professionalSchema>>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = professionalSchema.partial().safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('professional_profiles')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/professionals')
  revalidatePath('/consultants', 'layout')
  return { success: true as const, data: result }
}

const professionalUserIdSchema = z.string().uuid('Invalid professional user id.')

const adminAvailabilityTimingSlotSchema = z.object({
  id: z.string().uuid('Invalid availability slot.'),
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
})

const adminUpdateAvailabilityTimingsSchema = z.object({
  professionalUserId: professionalUserIdSchema,
  slots: z.array(adminAvailabilityTimingSlotSchema),
})

export type AdminAvailabilitySlot = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

export async function getProfessionalAvailabilityForAdmin(professionalUserId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const idParsed = professionalUserIdSchema.safeParse(professionalUserId)
  if (!idParsed.success) return { success: false as const, error: zodFirstError(idParsed.error) }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('professional_availability')
    .select('id, day_of_week, start_time, end_time, is_available')
    .eq('professional_id', idParsed.data)
    .order('day_of_week', { ascending: true })

  if (error) return { success: false as const, error: error.message }

  return {
    success: true as const,
    slots: (data ?? []).map((row) => ({
      id: row.id as string,
      dayOfWeek: Number(row.day_of_week),
      startTime: normalizeAvailabilityTime(String(row.start_time ?? '')),
      endTime: normalizeAvailabilityTime(String(row.end_time ?? '')),
      isAvailable: Boolean(row.is_available),
    })) satisfies AdminAvailabilitySlot[],
  }
}

export async function updateProfessionalAvailabilityTimings(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = adminUpdateAvailabilityTimingsSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  for (const slot of parsed.data.slots) {
    const start = normalizeAvailabilityTime(slot.startTime)
    const end = normalizeAvailabilityTime(slot.endTime)
    if (!isValidHourlyAvailabilityWindow(start, end)) {
      return {
        success: false as const,
        error: 'Each day needs end time at least 1 hour after start (24-hour format, e.g. 19:00 for 7 PM).',
      }
    }
  }

  const supabase = await createClient()
  const slotIds = parsed.data.slots.map((s) => s.id)

  if (slotIds.length > 0) {
    const { data: existing, error: fetchError } = await supabase
      .from('professional_availability')
      .select('id')
      .eq('professional_id', parsed.data.professionalUserId)
      .in('id', slotIds)

    if (fetchError) return { success: false as const, error: fetchError.message }
    if ((existing ?? []).length !== slotIds.length) {
      return { success: false as const, error: 'One or more availability slots were not found.' }
    }
  }

  for (const slot of parsed.data.slots) {
    const { error } = await supabase
      .from('professional_availability')
      .update({
        start_time: normalizeAvailabilityTime(slot.startTime),
        end_time: normalizeAvailabilityTime(slot.endTime),
        updated_at: new Date().toISOString(),
      })
      .eq('id', slot.id)
      .eq('professional_id', parsed.data.professionalUserId)

    if (error) return { success: false as const, error: error.message }
  }

  revalidatePath('/application/enter/professionals')
  revalidatePath('/book-consultation')
  revalidatePath('/consultants', 'layout')
  return { success: true as const }
}

export async function setProfessionalVerified(profileRowId: string, isVerified: boolean) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { error } = await supabase
    .from('professional_profiles')
    .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
    .eq('id', profileRowId)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/professionals')
  revalidatePath('/consultants', 'layout')
  return { success: true as const }
}

export async function deleteProfessional(profileRowId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { data: profile, error: fetchError } = await supabase
    .from('professional_profiles')
    .select('user_id')
    .eq('id', profileRowId)
    .single()

  if (fetchError || !profile?.user_id) {
    return {
      success: false as const,
      error: fetchError?.message ?? 'Professional profile not found.',
    }
  }

  return deleteUser(profile.user_id as string)
}

// ============================================
// APPOINTMENTS CRUD
// ============================================

export async function getProfessionalsForDropdown() {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [] as { id: string; name: string; email: string }[] }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'professional')
    .order('name', { ascending: true })

  if (error) return { success: false as const, error: error.message, data: [] }
  return { success: true as const, data: (data || []) as { id: string; name: string; email: string }[] }
}

export async function getAppointments(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase.from('guest_appointments').select('*', { count: 'exact' }).order('created_at', { ascending: false })

  const rawSearch = search?.trim() ?? ''
  if (rawSearch) {
    const escaped = rawSearch.replace(/[%]/g, '').replace(/,/g, ' ').trim()
    if (escaped) {
      const term = `%${escaped}%`
      query = query.or(
        `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone.ilike.${term},city.ilike.${term},state.ilike.${term},category.ilike.${term}`
      )
    }
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: rows, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }

  type GuestRow = Record<string, unknown> & { id: string; professional_id: string | null }
  const list = (rows ?? []) as GuestRow[]
  const profIds = [...new Set(list.map((r) => r.professional_id).filter((x): x is string => Boolean(x)))]

  const profMap = new Map<string, { id: string; name: string | null; email: string }>()
  if (profIds.length) {
    const { data: profs, error: profErr } = await supabase.from('users').select('id, name, email').in('id', profIds)
    if (!profErr && profs) {
      for (const p of profs) {
        profMap.set(p.id, { id: p.id, name: p.name, email: p.email })
      }
    }
  }

  const data: GuestAppointmentAdminRow[] = list.map((r) => {
    const base = r as unknown as Omit<GuestAppointmentAdminRow, 'professional'>
    return {
      ...base,
      professional: r.professional_id ? profMap.get(r.professional_id) ?? null : null,
    }
  })

  return { success: true as const, data, count: count || 0 }
}

export async function updateGuestAppointmentProfessional(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = guestAppointmentProfessionalSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { guestAppointmentId, professionalId } = parsed.data

  if (professionalId) {
    const { data: pro, error: proErr } = await supabase
      .from('users')
      .select('id')
      .eq('id', professionalId)
      .eq('role', 'professional')
      .maybeSingle()

    if (proErr || !pro) {
      return { success: false as const, error: 'That user is not a valid professional.' }
    }
  }

  const { error } = await supabase
    .from('guest_appointments')
    .update({ professional_id: professionalId })
    .eq('id', guestAppointmentId)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/appointments')
  return { success: true as const }
}

export async function saveGuestAppointmentCalendarInviteUrl(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = guestCalendarInviteSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { guestAppointmentId, url } = parsed.data

  const { data: existing, error: readErr } = await supabase
    .from('guest_appointments')
    .select('calendar_invite_url')
    .eq('id', guestAppointmentId)
    .maybeSingle()

  if (readErr) return { success: false as const, error: readErr.message }
  if (existing?.calendar_invite_url) {
    return { success: false as const, error: 'A calendar link is already saved for this appointment.' }
  }

  const { error } = await supabase
    .from('guest_appointments')
    .update({ calendar_invite_url: url })
    .eq('id', guestAppointmentId)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/appointments')
  return { success: true as const }
}

/** Step 1: Validate appointment and load patient/consultant details. */
export async function guestMeetingValidateStep(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = guestMeetingStepIdSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  try {
    const supabase = await createClient()
    const { loadGuestMeetingContext } = await import('@/lib/calendar/guestMeetingPipeline')
    const ctx = await loadGuestMeetingContext(supabase, parsed.data.guestAppointmentId)
    return {
      success: true as const,
      patientName: ctx.guestName,
      patientEmail: ctx.guestEmail,
      consultantName: ctx.professionalName,
      consultantEmail: ctx.professionalEmail,
    }
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Validation failed.',
    }
  }
}

/** Step 2: Create Google Meet or Jitsi meeting link. */
export async function guestMeetingCreateLinkStep(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = guestMeetingStepIdSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  try {
    const supabase = await createClient()
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline')
    const ctx = await pipeline.loadGuestMeetingContext(supabase, parsed.data.guestAppointmentId)
    const { meetUrl, provider } = await pipeline.generateGuestMeetingLink(ctx)
    return {
      success: true as const,
      meetUrl,
      provider,
      providerLabel: provider === 'google' ? 'Google Meet' : 'Jitsi',
    }
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Could not create meeting link.',
    }
  }
}

/** Step 3: Email invite to patient (Jitsi path only). */
export async function guestMeetingEmailPatientStep(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = guestMeetingPersistSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }
  if (parsed.data.provider !== 'jitsi') {
    return { success: true as const, skipped: true as const }
  }

  try {
    const supabase = await createClient()
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline')
    const ctx = await pipeline.loadGuestMeetingContext(supabase, parsed.data.guestAppointmentId)
    pipeline.assertMeetUrlForAppointment(
      parsed.data.guestAppointmentId,
      parsed.data.meetUrl,
      parsed.data.provider,
    )
    await pipeline.emailGuestMeetingInvitePatient(ctx, parsed.data.meetUrl)
    return { success: true as const, skipped: false as const, sentTo: ctx.guestEmail }
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Could not email the patient.',
    }
  }
}

/** Step 4: Email invite to consultant (Jitsi path only). */
export async function guestMeetingEmailConsultantStep(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = guestMeetingPersistSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }
  if (parsed.data.provider !== 'jitsi') {
    return { success: true as const, skipped: true as const }
  }

  try {
    const supabase = await createClient()
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline')
    const ctx = await pipeline.loadGuestMeetingContext(supabase, parsed.data.guestAppointmentId)
    pipeline.assertMeetUrlForAppointment(
      parsed.data.guestAppointmentId,
      parsed.data.meetUrl,
      parsed.data.provider,
    )
    await pipeline.emailGuestMeetingInviteConsultant(ctx, parsed.data.meetUrl)
    return { success: true as const, skipped: false as const, sentTo: ctx.professionalEmail }
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Could not email the consultant.',
    }
  }
}

/** Step 5: Persist meeting URL on the appointment. */
export async function guestMeetingSaveStep(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = guestMeetingPersistSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  try {
    const supabase = await createClient()
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline')
    await pipeline.loadGuestMeetingContext(supabase, parsed.data.guestAppointmentId)
    pipeline.assertMeetUrlForAppointment(
      parsed.data.guestAppointmentId,
      parsed.data.meetUrl,
      parsed.data.provider,
    )
    await pipeline.saveGuestMeetingUrl(supabase, parsed.data.guestAppointmentId, parsed.data.meetUrl)
    revalidatePath('/application/enter/appointments')
    return { success: true as const, meetUrl: parsed.data.meetUrl }
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Could not save meeting link.',
    }
  }
}

/** Creates a video meeting link and emails invites (single request; prefer stepped dialog in UI). */
export async function createAndSendGuestAppointmentMeeting(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = guestMeetingCreateSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  try {
    const supabase = await createClient()
    const pipeline = await import('@/lib/calendar/guestMeetingPipeline')
    const ctx = await pipeline.loadGuestMeetingContext(supabase, parsed.data.guestAppointmentId)
    const { createConsultationMeeting } = await import('@/lib/calendar/createConsultationMeeting')
    const result = await createConsultationMeeting(ctx)
    await pipeline.saveGuestMeetingUrl(supabase, parsed.data.guestAppointmentId, result.meetUrl)
    revalidatePath('/application/enter/appointments')
    return {
      success: true as const,
      meetUrl: result.meetUrl,
      provider: result.provider,
      invitesSent: result.invitesSent,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not create meeting or send invites.'
    return { success: false as const, error: msg }
  }
}

export async function createAppointment(data: z.infer<typeof appointmentSchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = appointmentSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('appointments')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/appointments')
  return { success: true as const, data: result }
}

export async function updateAppointment(id: string, data: Partial<z.infer<typeof appointmentSchema>>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = appointmentSchema.partial().safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('appointments')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/appointments')
  return { success: true as const, data: result }
}

export async function deleteAppointment(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { error } = await supabase.from('guest_appointments').delete().eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/appointments')
  return { success: true as const }
}

// ============================================
// MEDICAL HISTORY CRUD
// ============================================

export async function getMedicalHistory(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('medical_history')
    .select(`
      *,
      user:user_id (
        id,
        name,
        email
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`condition_name.ilike.%${search}%,status.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: data || [], count: count || 0 }
}

export async function createMedicalHistory(data: z.infer<typeof medicalHistorySchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = medicalHistorySchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('medical_history')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/medical-history')
  return { success: true as const, data: result }
}

export async function updateMedicalHistory(id: string, data: Partial<z.infer<typeof medicalHistorySchema>>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = medicalHistorySchema.partial().safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('medical_history')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/medical-history')
  return { success: true as const, data: result }
}

export async function deleteMedicalHistory(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { error } = await supabase
    .from('medical_history')
    .delete()
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/medical-history')
  return { success: true as const }
}

// ============================================
// MEDICATIONS CRUD
// ============================================

export async function getMedications(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('medications')
    .select(`
      *,
      user:user_id (
        id,
        name,
        email
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`medication_name.ilike.%${search}%,dosage.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: data || [], count: count || 0 }
}

export async function createMedication(data: z.infer<typeof medicationSchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = medicationSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('medications')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/medications')
  return { success: true as const, data: result }
}

export async function updateMedication(id: string, data: Partial<z.infer<typeof medicationSchema>>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = medicationSchema.partial().safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('medications')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/medications')
  return { success: true as const, data: result }
}

export async function deleteMedication(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/medications')
  return { success: true as const }
}

// ============================================
// DOCUMENTS CRUD
// ============================================

export async function getDocuments(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('medical_documents')
    .select(`
      *,
      user:user_id (
        id,
        name,
        email
      )
    `, { count: 'exact' })
    .order('upload_date', { ascending: false })

  if (search) {
    query = query.or(`document_name.ilike.%${search}%,document_type.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: data || [], count: count || 0 }
}

export async function createDocument(data: z.infer<typeof documentSchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = documentSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('medical_documents')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/documents')
  return { success: true as const, data: result }
}

export async function updateDocument(id: string, data: Partial<z.infer<typeof documentSchema>>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = documentSchema.partial().safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('medical_documents')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/documents')
  return { success: true as const, data: result }
}

export async function deleteDocument(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { error } = await supabase
    .from('medical_documents')
    .delete()
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/documents')
  return { success: true as const }
}

const qualificationDocumentApprovalSchema = z.object({
  id: z.string().uuid('Invalid qualification id'),
  documentApproved: z.boolean(),
})

/** Professional qualification rows that include a verification file (admin review queue). */
export async function getQualificationCredentialsForAdmin(
  page: number = 1,
  limit: number = 10,
  search?: string
) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('professional_qualifications')
    .select(
      `
      id,
      professional_id,
      degree,
      institution,
      year,
      document_url,
      document_approved,
      created_at,
      professional:professional_id(name, email)
    `,
      { count: 'exact' }
    )
    .not('document_url', 'is', null)
    .order('created_at', { ascending: false })

  if (search?.trim()) {
    const q = search.trim().replace(/[%*,]/g, '')
    if (q) {
      query = query.or(`degree.ilike.%${q}%,institution.ilike.%${q}%`)
    }
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: data || [], count: count || 0 }
}

export async function setQualificationDocumentApproval(input: z.infer<typeof qualificationDocumentApprovalSchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = qualificationDocumentApprovalSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { error } = await supabase
    .from('professional_qualifications')
    .update({
      document_approved: parsed.data.documentApproved,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/documents')
  revalidatePath('/dashboard')
  revalidatePath('/consultants', 'layout')
  return { success: true as const }
}

// ============================================
// INSURANCE CRUD
// ============================================

export async function getInsurance(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('insurance')
    .select(`
      *,
      user:user_id (
        id,
        name,
        email
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`provider_name.ilike.%${search}%,policy_number.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: data || [], count: count || 0 }
}

export async function createInsurance(data: z.infer<typeof insuranceSchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = insuranceSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('insurance')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/insurance')
  return { success: true as const, data: result }
}

export async function updateInsurance(id: string, data: Partial<z.infer<typeof insuranceSchema>>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = insuranceSchema.partial().safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('insurance')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/insurance')
  return { success: true as const, data: result }
}

export async function deleteInsurance(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { error } = await supabase
    .from('insurance')
    .delete()
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/insurance')
  return { success: true as const }
}

// ============================================
// NEWSLETTER CRUD
// ============================================

export async function getNewsletterSubscribers(
  page: number = 1,
  limit: number = 10,
  search?: string,
  statuses?: string[],
) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('subscribed_at', { ascending: false })

  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  // Default to active + resubscribed when no statuses param is supplied,
  // matching the admin UI's "show currently subscribed" default view.
  const statusFilter = statuses && statuses.length > 0 ? statuses : ['active', 'resubscribed']
  query = query.in('status', statusFilter)

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: data || [], count: count || 0 }
}

export async function createNewsletterSubscriber(data: z.infer<typeof newsletterSchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = newsletterSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('newsletter_subscribers')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/newsletter')
  return { success: true as const, data: result }
}

export async function updateNewsletterSubscriber(id: number, data: Partial<z.infer<typeof newsletterSchema>>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const parsed = newsletterSchema.partial().safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const { data: result, error } = await supabase
    .from('newsletter_subscribers')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/newsletter')
  return { success: true as const, data: result }
}

export async function deleteNewsletterSubscriber(id: number) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/newsletter')
  return { success: true as const }
}

/** Count of subscribers who receive newsletter broadcasts (active + resubscribed). */
export async function getNewsletterActiveRecipientCount() {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, count: 0 }
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .in('status', ['active', 'resubscribed'])

  if (error) return { success: false as const, error: error.message, count: 0 }
  return { success: true as const, count: count ?? 0 }
}

/**
 * Queue an HTML newsletter to all active subscribers and store the campaign as ONE row,
 * with `recipient_ids` holding the list of newsletter_subscribers.id values it was sent to.
 * Emails are looked up at render time by joining recipient_ids back to newsletter_subscribers.
 *
 * SMTP delivery happens in after() so the action returns instantly.
 */
export async function sendNewsletterBroadcast(data: z.infer<typeof newsletterBroadcastSchema>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = newsletterBroadcastSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rows, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email')
    .in('status', ['active', 'resubscribed'])

  if (error) return { success: false as const, error: error.message }

  // De-dupe by email (case-insensitive) but keep the matching subscriber id.
  const seen = new Set<string>()
  const recipients: { id: number; email: string }[] = []
  for (const r of rows ?? []) {
    const norm = (r.email || '').trim().toLowerCase()
    if (!norm || seen.has(norm)) continue
    seen.add(norm)
    recipients.push({ id: r.id as number, email: r.email as string })
  }

  if (recipients.length === 0) {
    return { success: false as const, error: 'No active subscribers to send to.' }
  }

  const { subject, htmlBody } = parsed.data
  const recipientIds = recipients.map((r) => r.id)

  const { data: campaign, error: campaignErr } = await supabase
    .from('newsletter_campaigns')
    .insert({
      subject,
      body_html: htmlBody,
      sent_by: user?.id ?? null,
      recipient_ids: recipientIds,
    })
    .select('id')
    .single()

  if (campaignErr || !campaign) {
    console.error('[sendNewsletterBroadcast] failed to record campaign:', campaignErr)
    return { success: false as const, error: campaignErr?.message || 'Failed to record campaign.' }
  }

  after(async () => {
    const { sendNewsletterBroadcastEmail } = await import('@/lib/mailer')
    for (const r of recipients) {
      try {
        await sendNewsletterBroadcastEmail(r.email, subject, htmlBody)
        await new Promise((res) => setTimeout(res, 350))
      } catch (e) {
        console.error('[sendNewsletterBroadcast] failed for', r.email, e)
      }
    }
  })

  revalidatePath('/application/enter/newsletter/campaigns')
  return { success: true as const, queued: recipients.length, campaignId: campaign.id }
}

// ---------------------------------------------------------------------------
// Newsletter campaigns (sent log) — single-table read APIs
// ---------------------------------------------------------------------------

export type NewsletterCampaignRow = {
  id: string
  subject: string
  body_html: string
  sent_by: string | null
  recipient_ids: number[]
  created_at: string
}

export async function getNewsletterCampaigns(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [] as NewsletterCampaignRow[], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('newsletter_campaigns')
    .select('id, subject, body_html, sent_by, recipient_ids, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  const q = search?.trim()
  if (q) query = query.ilike('subject', `%${q}%`)

  const from = (page - 1) * limit
  const to = from + limit - 1
  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [] as NewsletterCampaignRow[], count: 0 }
  return { success: true as const, data: (data || []) as NewsletterCampaignRow[], count: count || 0 }
}

export type CampaignRecipientEmail = {
  id: number
  email: string
  status: string // 'active' | 'resubscribed' | 'unsubscribed' (current status — best-effort)
}

/**
 * Resolve the recipient_ids stored on a campaign back to subscriber rows so we can show
 * the comma-separated email list in the admin UI.
 */
export async function getCampaignRecipientEmails(campaignId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [] as CampaignRecipientEmail[] }
  const supabase = await createClient()

  const { data: campaign, error: campaignErr } = await supabase
    .from('newsletter_campaigns')
    .select('recipient_ids')
    .eq('id', campaignId)
    .maybeSingle()

  if (campaignErr) return { success: false as const, error: campaignErr.message, data: [] as CampaignRecipientEmail[] }
  const ids = (campaign?.recipient_ids ?? []) as number[]
  if (ids.length === 0) return { success: true as const, data: [] as CampaignRecipientEmail[] }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status')
    .in('id', ids)
    .order('email', { ascending: true })

  if (error) return { success: false as const, error: error.message, data: [] as CampaignRecipientEmail[] }
  return { success: true as const, data: (data || []) as CampaignRecipientEmail[] }
}

export async function deleteNewsletterCampaign(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { error } = await supabase.from('newsletter_campaigns').delete().eq('id', id)
  if (error) return { success: false as const, error: error.message }

  revalidatePath('/application/enter/newsletter/campaigns')
  return { success: true as const }
}

// ============================================
// CONTACT ENQUIRIES (contact_messages)
// ============================================

export type ContactMessageRow = {
  id: string
  email: string
  subject: string
  message: string
  created_at: string
}

const contactMessageDeleteSchema = z.object({
  id: z.string().uuid('Invalid message id'),
})

export async function getContactMessages(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('contact_messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  const q = search?.trim()
  if (q) {
    query = query.ilike('email', `%${q}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: (data || []) as ContactMessageRow[], count: count || 0 }
}

export async function deleteContactMessage(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const parsed = contactMessageDeleteSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').delete().eq('id', parsed.data.id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/enquiries')
  return { success: true as const }
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const [
    users,
    clientUsers,
    professionals,
    verifiedProfessionals,
    appointments,
    enquiries,
    newsletter,
    newsletterActive,
    newsletterResubscribed,
    newsletterUnsubscribed,
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('professional_profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('professional_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true),
    supabase.from('guest_appointments').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resubscribed'),
    supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unsubscribed'),
  ])

  return {
    success: true as const,
    totalUsers: users.count || 0,
    clientUsers: clientUsers.count || 0,
    totalProfessionals: professionals.count || 0,
    verifiedProfessionals: verifiedProfessionals.count || 0,
    totalAppointments: appointments.count || 0,
    totalEnquiries: enquiries.count || 0,
    newsletterSubscribers: newsletter.count || 0,
    newsletterActive: newsletterActive.count || 0,
    newsletterResubscribed: newsletterResubscribed.count || 0,
    newsletterUnsubscribed: newsletterUnsubscribed.count || 0,
  }
}

function guestAppointmentSlotIso(row: { appointment_date: string; appointment_time: string }): string {
  const date = String(row.appointment_date).slice(0, 10)
  let time = String(row.appointment_time ?? '').trim()
  if (!time) return `${date}T00:00:00`
  if (/^\d{1,2}:\d{2}$/.test(time)) time = `${time}:00`
  return `${date}T${time}`
}

export type RecentAdminAppointmentRow = {
  id: string
  kind: 'registered' | 'guest'
  client: { name: string; email?: string | null } | null
  professional: { name: string; email?: string | null } | null
  /** Scheduled start (registered: DB timestamptz; guest: date + time from booking form). */
  start_time: string
  created_at: string
}

export async function getRecentAppointments(limit: number = 5) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [] as RecentAdminAppointmentRow[] }
  const supabase = await createClient()

  const n = Math.max(1, limit)
  const [{ data: apts, error: aptErr }, { data: guests, error: guestErr }] = await Promise.all([
    supabase
      .from('appointments')
      .select(
        `*, client:users!appointments_client_id_fkey(id,name,email), professional:users!appointments_professional_id_fkey(id,name,email)`,
      )
      .order('created_at', { ascending: false })
      .limit(n),
    supabase.from('guest_appointments').select('*').order('created_at', { ascending: false }).limit(n),
  ])

  if (aptErr) return { success: false as const, error: aptErr.message, data: [] }
  if (guestErr) return { success: false as const, error: guestErr.message, data: [] }

  const guestList = guests ?? []
  const profIds = [...new Set(guestList.map((g: { professional_id?: string | null }) => g.professional_id).filter((x): x is string => Boolean(x)))]
  const profMap = new Map<string, { name: string }>()
  if (profIds.length) {
    const { data: profs, error: profErr } = await supabase.from('users').select('id, name').in('id', profIds)
    if (profErr) return { success: false as const, error: profErr.message, data: [] }
    for (const p of profs ?? []) profMap.set(p.id, { name: p.name })
  }

  const registered: RecentAdminAppointmentRow[] = (apts ?? []).map((a: Record<string, unknown>) => ({
    id: a.id as string,
    kind: 'registered' as const,
    client: (a.client as { name?: string; email?: string } | null)
      ? { name: String((a.client as { name?: string }).name ?? ''), email: (a.client as { email?: string }).email }
      : null,
    professional: (a.professional as { name?: string; email?: string } | null)
      ? {
          name: String((a.professional as { name?: string }).name ?? ''),
          email: (a.professional as { email?: string }).email,
        }
      : null,
    start_time: String(a.start_time),
    created_at: String(a.created_at),
  }))

  const guestRows: RecentAdminAppointmentRow[] = guestList.map((g: Record<string, unknown>) => {
    const fn = String(g.first_name ?? '').trim()
    const ln = String(g.last_name ?? '').trim()
    const name = [fn, ln].filter(Boolean).join(' ') || 'Guest'
    const pid = g.professional_id as string | null | undefined
    return {
      id: g.id as string,
      kind: 'guest' as const,
      client: { name, email: (g.email as string) ?? null },
      professional: pid ? { name: profMap.get(pid)?.name ?? '—' } : { name: '—' },
      start_time: guestAppointmentSlotIso({
        appointment_date: String(g.appointment_date),
        appointment_time: String(g.appointment_time ?? ''),
      }),
      created_at: String(g.created_at),
    }
  })

  const merged = [...registered, ...guestRows]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, n)

  return { success: true as const, data: merged }
}

export async function getRecentUsers(limit: number = 5) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [] }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { success: false as const, error: error.message, data: [] }
  return { success: true as const, data: data || [] }
}

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')

const adminNotificationsDateFilterSchema = z
  .object({
    from: dateOnlySchema.optional(),
    to: dateOnlySchema.optional(),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true
      return data.from <= data.to
    },
    { message: 'Start date must be on or before end date' }
  )

function adminNotificationDateBounds(from?: string, to?: string) {
  return {
    fromIso: from ? `${from}T00:00:00.000Z` : undefined,
    toIso: to ? `${to}T23:59:59.999Z` : undefined,
  }
}

export type AdminNotificationRow = {
  id: string
  type: string
  title: string
  body: string | null
  actor_user_id: string | null
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
  actor?: { id: string; name: string; email: string; role: string } | null
}

export async function getAdminUnreadNotificationCount(): Promise<number> {
  const auth = await requireAdmin()
  if (!auth.ok) return 0
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('admin_notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
  if (error) {
    console.error('getAdminUnreadNotificationCount:', error.message)
    return 0
  }
  return count ?? 0
}

export async function getAdminNotifications(
  limit: number = 100,
  dateFilter?: { from?: string; to?: string }
): Promise<
  | { success: true; data: AdminNotificationRow[] }
  | { success: false; error: string; data: [] }
> {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false, error: auth.error, data: [] }

  const parsed = adminNotificationsDateFilterSchema.safeParse(dateFilter ?? {})
  if (!parsed.success) {
    return { success: false, error: zodFirstError(parsed.error), data: [] }
  }

  const { fromIso, toIso } = adminNotificationDateBounds(parsed.data.from, parsed.data.to)
  const supabase = await createClient()

  let query = supabase
    .from('admin_notifications')
    .select('id, type, title, body, actor_user_id, metadata, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(Math.min(500, Math.max(1, limit)))

  if (fromIso) query = query.gte('created_at', fromIso)
  if (toIso) query = query.lte('created_at', toIso)

  const { data: rows, error } = await query

  if (error) return { success: false, error: error.message, data: [] }

  const list = rows ?? []
  const actorIds = [...new Set(list.map((r) => r.actor_user_id).filter((x): x is string => Boolean(x)))]
  const actorMap = new Map<string, { id: string; name: string; email: string; role: string }>()
  if (actorIds.length) {
    const { data: users, error: uErr } = await supabase
      .from('users')
      .select('id, name, email, role')
      .in('id', actorIds)
    if (!uErr && users) {
      for (const u of users) {
        actorMap.set(u.id, u)
      }
    }
  }

  const data: AdminNotificationRow[] = list.map((r) => ({
    ...r,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    actor: r.actor_user_id ? actorMap.get(r.actor_user_id) ?? null : null,
  }))

  return { success: true, data }
}

const markNotificationReadSchema = z.object({
  id: z.string().uuid('Invalid notification id'),
})

export async function markAdminNotificationRead(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = markNotificationReadSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase
    .from('admin_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
    .is('read_at', null)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter')
  revalidatePath('/application/enter/notifications')
  return { success: true as const }
}

export async function markAllAdminNotificationsRead() {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('admin_notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter')
  revalidatePath('/application/enter/notifications')
  return { success: true as const }
}

// ============================================
// APP SETTINGS
// ============================================

const updateRegistrationSettingsSchema = registrationSettingsSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one setting must be provided.' },
)

export async function getAdminRegistrationSettings(): Promise<
  | { success: true; data: RegistrationSettings; updatedAt: string | null }
  | { success: false; error: string }
> {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('value, updated_at')
    .eq('key', REGISTRATION_SETTINGS_KEY)
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  return {
    success: true,
    data: parseRegistrationSettings(data?.value),
    updatedAt: data?.updated_at ?? null,
  }
}

export async function updateRegistrationSettings(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = updateRegistrationSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false as const, error: zodFirstError(parsed.error) }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const currentRes = await getAdminRegistrationSettings()
  if (!currentRes.success) {
    return { success: false as const, error: currentRes.error }
  }

  const nextValue: RegistrationSettings = {
    ...currentRes.data,
    ...parsed.data,
  }

  const { error } = await supabase.from('app_settings').upsert(
    {
      key: REGISTRATION_SETTINGS_KEY,
      value: nextValue,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    },
    { onConflict: 'key' },
  )

  if (error) return { success: false as const, error: error.message }

  revalidatePath('/application/enter/settings')
  revalidatePath('/')
  return { success: true as const, data: nextValue }
}

const updateBookingSettingsSchema = bookingSettingsSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one setting must be provided.' },
)

export async function getAdminBookingSettings(): Promise<
  | { success: true; data: BookingSettings; updatedAt: string | null }
  | { success: false; error: string }
> {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('value, updated_at')
    .eq('key', BOOKING_SETTINGS_KEY)
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  return {
    success: true,
    data: parseBookingSettings(data?.value),
    updatedAt: data?.updated_at ?? null,
  }
}

export async function updateBookingSettings(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = updateBookingSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false as const, error: zodFirstError(parsed.error) }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const currentRes = await getAdminBookingSettings()
  if (!currentRes.success) {
    return { success: false as const, error: currentRes.error }
  }

  const nextValue: BookingSettings = {
    ...currentRes.data,
    ...parsed.data,
  }

  const { error } = await supabase.from('app_settings').upsert(
    {
      key: BOOKING_SETTINGS_KEY,
      value: nextValue,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    },
    { onConflict: 'key' },
  )

  if (error) return { success: false as const, error: error.message }

  revalidatePath('/application/enter/settings')
  revalidatePath('/book-consultation')
  return { success: true as const, data: nextValue }
}

// ============================================
// BOOKING ORDERS & PAYMENTS (admin)
// ============================================

export type BookingOrderAdminRow = {
  id: string
  order_number: string
  status: string
  failure_reason: string | null
  amount_paise: number
  currency: string
  expires_at: string
  paid_at: string | null
  confirmed_at: string | null
  created_at: string
  guest_appointment_id: string | null
  payment_provider: string
  provider_payment_id: string | null
  booking_snapshot: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    date?: string
    time?: string
    category?: string
    city?: string
    state?: string
  }
  client: { id: string; name: string; email: string } | null
  professional: { id: string; name: string; email: string } | null
}

export type PaymentAdminRow = {
  id: string
  booking_order_id: string
  amount: number
  status: string
  payment_method: string
  transaction_id: string | null
  created_at: string
  guest_appointment_id: string | null
  order_number: string | null
  client: { id: string; name: string; email: string } | null
  professional: { id: string; name: string; email: string } | null
}

export async function getAdminBookingOrders(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  await supabase.rpc('expire_stale_booking_orders')

  let query = supabase
    .from('booking_orders')
    .select(
      `
      *,
      client:users!booking_orders_user_id_fkey(id, name, email),
      professional:users!booking_orders_professional_id_fkey(id, name, email)
    `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })

  const statusFilter = status?.trim()
  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const rawSearch = search?.trim() ?? ''
  if (rawSearch) {
    const escaped = rawSearch.replace(/[%]/g, '').replace(/,/g, ' ').trim()
    if (escaped) {
      const term = `%${escaped}%`
      query = query.or(`order_number.ilike.${term},failure_reason.ilike.${term}`)
    }
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  const { data: rows, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }

  const data = (rows ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    order_number: row.order_number as string,
    status: row.status as string,
    failure_reason: (row.failure_reason as string | null) ?? null,
    amount_paise: row.amount_paise as number,
    currency: row.currency as string,
    expires_at: row.expires_at as string,
    paid_at: (row.paid_at as string | null) ?? null,
    confirmed_at: (row.confirmed_at as string | null) ?? null,
    created_at: row.created_at as string,
    guest_appointment_id: (row.guest_appointment_id as string | null) ?? null,
    payment_provider: row.payment_provider as string,
    provider_payment_id: (row.provider_payment_id as string | null) ?? null,
    booking_snapshot: (row.booking_snapshot as BookingOrderAdminRow['booking_snapshot']) ?? {},
    client: (row.client as BookingOrderAdminRow['client']) ?? null,
    professional: (row.professional as BookingOrderAdminRow['professional']) ?? null,
  })) satisfies BookingOrderAdminRow[]

  return { success: true as const, data, count: count || 0 }
}

export async function getAdminPayments(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('payments')
    .select(
      `
      *,
      client:users!payments_client_id_fkey(id, name, email),
      professional:users!payments_professional_id_fkey(id, name, email),
      booking_order:booking_orders!payments_booking_order_id_fkey(order_number)
    `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })

  const rawSearch = search?.trim() ?? ''
  if (rawSearch) {
    const escaped = rawSearch.replace(/[%]/g, '').replace(/,/g, ' ').trim()
    if (escaped) {
      const term = `%${escaped}%`
      query = query.or(`transaction_id.ilike.${term},payment_method.ilike.${term}`)
    }
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  const { data: rows, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }

  const data = (rows ?? []).map((row: Record<string, unknown>) => {
    const bookingOrder = row.booking_order as { order_number?: string } | null
    return {
      id: row.id as string,
      booking_order_id: row.booking_order_id as string,
      amount: row.amount as number,
      status: row.status as string,
      payment_method: row.payment_method as string,
      transaction_id: (row.transaction_id as string | null) ?? null,
      created_at: row.created_at as string,
      guest_appointment_id: (row.guest_appointment_id as string | null) ?? null,
      order_number: bookingOrder?.order_number ?? null,
      client: (row.client as PaymentAdminRow['client']) ?? null,
      professional: (row.professional as PaymentAdminRow['professional']) ?? null,
    }
  }) satisfies PaymentAdminRow[]

  return { success: true as const, data, count: count || 0 }
}
