'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { zodFirstError } from '@/lib/server-action-result'

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
  status: z.enum(['active', 'inactive']).default('active'),
})

const guestAppointmentProfessionalSchema = z.object({
  guestAppointmentId: z.string().uuid('Invalid guest appointment id'),
  professionalId: z.union([z.string().uuid('Invalid professional id'), z.null()]),
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
}

// ============================================
// HELPER: Admin session (never throws — returns message for clients in production)
// ============================================

async function requireAdmin(): Promise<
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

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .neq('role', 'admin')
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

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/users')
  return { success: true as const }
}

// ============================================
// PROFESSIONALS CRUD
// ============================================

export async function getProfessionals(page: number = 1, limit: number = 10, search?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from('professional_profiles')
    .select(`
      *,
      users:user_id (
        id,
        name,
        email,
        phone,
        image
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`specialization.ilike.%${search}%,license_number.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: data || [], count: count || 0 }
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
  return { success: true as const, data: result }
}

export async function deleteProfessional(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const { error } = await supabase
    .from('professional_profiles')
    .delete()
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/professionals')
  return { success: true as const }
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

export async function getNewsletterSubscribers(page: number = 1, limit: number = 10, search?: string) {
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

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }
  const supabase = await createClient()

  const [users, professionals, appointments, documents, newsletter] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('professional_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('medical_documents').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
  ])

  return {
    success: true as const,
    totalUsers: users.count || 0,
    totalProfessionals: professionals.count || 0,
    totalAppointments: appointments.count || 0,
    totalDocuments: documents.count || 0,
    newsletterSubscribers: newsletter.count || 0,
  }
}

export async function getRecentAppointments(limit: number = 5) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [] }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:client_id (
        id,
        name,
        email
      ),
      professional:professional_id (
        id,
        name,
        email
      )
    `)
    .order('start_time', { ascending: false })
    .limit(limit)

  if (error) return { success: false as const, error: error.message, data: [] }
  return { success: true as const, data: data || [] }
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
