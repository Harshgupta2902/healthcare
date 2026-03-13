'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

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

// ============================================
// HELPER: Check Admin
// ============================================

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  return { supabase, user }
}

// ============================================
// USERS CRUD
// ============================================

export async function getUsers(page: number = 1, limit: number = 10, search?: string) {
  await checkAdmin()
  const supabase = await createClient()

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function createUser(data: z.infer<typeof userSchema>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = userSchema.parse(data)
  
  const { data: result, error } = await supabase
    .from('users')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/users')
  return result
}

export async function updateUser(id: string, data: Partial<z.infer<typeof userSchema>>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = userSchema.partial().parse(data)
  
  const { data: result, error } = await supabase
    .from('users')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/users')
  return result
}

export async function deleteUser(id: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/application/enter/users')
}

// ============================================
// PROFESSIONALS CRUD
// ============================================

export async function getProfessionals(page: number = 1, limit: number = 10, search?: string) {
  await checkAdmin()
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

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function createProfessional(data: z.infer<typeof professionalSchema>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = professionalSchema.parse(data)
  
  const { data: result, error } = await supabase
    .from('professional_profiles')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/professionals')
  return result
}

export async function updateProfessional(id: string, data: Partial<z.infer<typeof professionalSchema>>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = professionalSchema.partial().parse(data)
  
  const { data: result, error } = await supabase
    .from('professional_profiles')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/professionals')
  return result
}

export async function deleteProfessional(id: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('professional_profiles')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/application/enter/professionals')
}

// ============================================
// APPOINTMENTS CRUD
// ============================================

export async function getAppointments(page: number = 1, limit: number = 10, search?: string) {
  await checkAdmin()
  const supabase = await createClient()

  let query = supabase
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
    `, { count: 'exact' })
    .order('start_time', { ascending: false })

  if (search) {
    query = query.or(`appointment_type.ilike.%${search}%,status.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function createAppointment(data: z.infer<typeof appointmentSchema>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = appointmentSchema.parse(data)
  
  const { data: result, error } = await supabase
    .from('appointments')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/appointments')
  return result
}

export async function updateAppointment(id: string, data: Partial<z.infer<typeof appointmentSchema>>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = appointmentSchema.partial().parse(data)
  
  const { data: result, error } = await supabase
    .from('appointments')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/appointments')
  return result
}

export async function deleteAppointment(id: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/application/enter/appointments')
}

// ============================================
// MEDICAL HISTORY CRUD
// ============================================

export async function getMedicalHistory(page: number = 1, limit: number = 10, search?: string) {
  await checkAdmin()
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

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function createMedicalHistory(data: z.infer<typeof medicalHistorySchema>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = medicalHistorySchema.parse(data)
  
  const { data: result, error } = await supabase
    .from('medical_history')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/medical-history')
  return result
}

export async function updateMedicalHistory(id: string, data: Partial<z.infer<typeof medicalHistorySchema>>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = medicalHistorySchema.partial().parse(data)
  
  const { data: result, error } = await supabase
    .from('medical_history')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/medical-history')
  return result
}

export async function deleteMedicalHistory(id: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('medical_history')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/application/enter/medical-history')
}

// ============================================
// MEDICATIONS CRUD
// ============================================

export async function getMedications(page: number = 1, limit: number = 10, search?: string) {
  await checkAdmin()
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

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function createMedication(data: z.infer<typeof medicationSchema>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = medicationSchema.parse(data)
  
  const { data: result, error } = await supabase
    .from('medications')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/medications')
  return result
}

export async function updateMedication(id: string, data: Partial<z.infer<typeof medicationSchema>>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = medicationSchema.partial().parse(data)
  
  const { data: result, error } = await supabase
    .from('medications')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/medications')
  return result
}

export async function deleteMedication(id: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/application/enter/medications')
}

// ============================================
// DOCUMENTS CRUD
// ============================================

export async function getDocuments(page: number = 1, limit: number = 10, search?: string) {
  await checkAdmin()
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

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function createDocument(data: z.infer<typeof documentSchema>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = documentSchema.parse(data)
  
  const { data: result, error } = await supabase
    .from('medical_documents')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/documents')
  return result
}

export async function updateDocument(id: string, data: Partial<z.infer<typeof documentSchema>>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = documentSchema.partial().parse(data)
  
  const { data: result, error } = await supabase
    .from('medical_documents')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/documents')
  return result
}

export async function deleteDocument(id: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('medical_documents')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/application/enter/documents')
}

// ============================================
// INSURANCE CRUD
// ============================================

export async function getInsurance(page: number = 1, limit: number = 10, search?: string) {
  await checkAdmin()
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

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function createInsurance(data: z.infer<typeof insuranceSchema>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = insuranceSchema.parse(data)
  
  const { data: result, error } = await supabase
    .from('insurance')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/insurance')
  return result
}

export async function updateInsurance(id: string, data: Partial<z.infer<typeof insuranceSchema>>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = insuranceSchema.partial().parse(data)
  
  const { data: result, error } = await supabase
    .from('insurance')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/insurance')
  return result
}

export async function deleteInsurance(id: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('insurance')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/application/enter/insurance')
}

// ============================================
// NEWSLETTER CRUD
// ============================================

export async function getNewsletterSubscribers(page: number = 1, limit: number = 10, search?: string) {
  await checkAdmin()
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

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function createNewsletterSubscriber(data: z.infer<typeof newsletterSchema>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = newsletterSchema.parse(data)
  
  const { data: result, error } = await supabase
    .from('newsletter_subscribers')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/newsletter')
  return result
}

export async function updateNewsletterSubscriber(id: number, data: Partial<z.infer<typeof newsletterSchema>>) {
  await checkAdmin()
  const supabase = await createClient()
  
  const validated = newsletterSchema.partial().parse(data)
  
  const { data: result, error } = await supabase
    .from('newsletter_subscribers')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/application/enter/newsletter')
  return result
}

export async function deleteNewsletterSubscriber(id: number) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/application/enter/newsletter')
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  await checkAdmin()
  const supabase = await createClient()

  const [users, professionals, appointments, documents, newsletter] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('professional_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('medical_documents').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalUsers: users.count || 0,
    totalProfessionals: professionals.count || 0,
    totalAppointments: appointments.count || 0,
    totalDocuments: documents.count || 0,
    newsletterSubscribers: newsletter.count || 0,
  }
}

export async function getRecentAppointments(limit: number = 5) {
  await checkAdmin()
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

  if (error) throw error
  return data || []
}

export async function getRecentUsers(limit: number = 5) {
  await checkAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
