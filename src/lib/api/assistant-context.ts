import type { SupabaseClient, User } from '@supabase/supabase-js'
import { fetchGuestAppointmentProfessionalMeta } from '@/lib/guest-appointment-professional-meta'

type AssistantAppointment = {
  id: string
  kind: 'client_request' | 'professional_guest' | 'professional_consultation'
  title: string
  status?: string | null
  category?: string | null
  appointmentDate?: string | null
  appointmentTime?: string | null
  createdAt?: string | null
  location?: string | null
  personName?: string | null
  professionalName?: string | null
  hasPrescription: boolean
  prescriptionUpdatedAt?: string | null
  prescriptionHighlights: string[]
}

function stripHtmlToText(html: string | null | undefined) {
  if (!html) return ''
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()
}

function buildPrescriptionHighlights(html: string | null | undefined) {
  const text = stripHtmlToText(html)
  if (!text) return []
  return text
    .split(/\n|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 2)
    .slice(0, 6)
}

function sortByAppointmentTimeDesc(a: AssistantAppointment, b: AssistantAppointment) {
  const aKey = `${a.appointmentDate || ''}T${a.appointmentTime || '00:00'}`
  const bKey = `${b.appointmentDate || ''}T${b.appointmentTime || '00:00'}`
  return bKey.localeCompare(aKey)
}

export async function buildAssistantContext(supabase: SupabaseClient, user: User) {
  const { data: userRow } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  const role = (userRow?.role || user.user_metadata?.role || 'client') as
    | 'client'
    | 'professional'
    | 'admin'
  const displayName = userRow?.name || user.user_metadata?.name || user.email || 'there'

  if (role === 'professional') {
    const [{ data: guestRows }, { data: appointmentRows }] = await Promise.all([
      supabase
        .from('guest_appointments')
        .select(
          'id, first_name, last_name, category, state, city, appointment_date, appointment_time, created_at, prescription_html, prescription_updated_at',
        )
        .eq('professional_id', user.id)
        .order('appointment_date', { ascending: false })
        .limit(8),
      supabase
        .from('appointments')
        .select(
          'id, appointment_type, status, start_time, created_at, client:users!appointments_client_id_fkey(name, email)',
        )
        .eq('professional_id', user.id)
        .order('start_time', { ascending: false })
        .limit(8),
    ])

    const guestAppointments: AssistantAppointment[] = (guestRows || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      kind: 'professional_guest',
      title: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Guest booking',
      category: (row.category as string) || null,
      appointmentDate: (row.appointment_date as string) || null,
      appointmentTime: (row.appointment_time as string) || null,
      createdAt: (row.created_at as string) || null,
      location: [row.city, row.state].filter(Boolean).join(', ') || null,
      personName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Guest',
      hasPrescription: Boolean(row.prescription_html),
      prescriptionUpdatedAt: (row.prescription_updated_at as string) || null,
      prescriptionHighlights: buildPrescriptionHighlights(row.prescription_html as string),
    }))

    const professionalAppointments: AssistantAppointment[] = (appointmentRows || []).map(
      (row: Record<string, unknown>) => ({
        id: row.id as string,
        kind: 'professional_consultation',
        title: (row.appointment_type as string) || 'Consultation',
        status: (row.status as string) || null,
        appointmentDate: (row.start_time as string) || null,
        createdAt: (row.created_at as string) || null,
        personName:
          ((row.client as { name?: string; email?: string })?.name ||
            (row.client as { email?: string })?.email ||
            'Client') as string,
        hasPrescription: false,
        prescriptionHighlights: [],
      }),
    )

    return {
      success: true as const,
      isAuthenticated: true,
      role,
      userId: user.id,
      displayName,
      appointments: [...guestAppointments, ...professionalAppointments]
        .sort(sortByAppointmentTimeDesc)
        .slice(0, 10),
    }
  }

  const { data: guestAppointments } = await supabase
    .from('guest_appointments')
    .select(
      'id, professional_id, category, state, city, appointment_date, appointment_time, created_at, prescription_html, prescription_updated_at',
    )
    .eq('created_by', user.id)
    .order('appointment_date', { ascending: false })
    .limit(10)

  const professionalIds = Array.from(
    new Set(
      (guestAppointments || [])
        .map((row: { professional_id?: string }) => row.professional_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  )
  const professionalMeta = await fetchGuestAppointmentProfessionalMeta(supabase, professionalIds)

  const appointments: AssistantAppointment[] = (guestAppointments || []).map((row: Record<string, unknown>) => {
    const professionalId = row.professional_id as string | undefined
    const meta = professionalId ? professionalMeta[professionalId] : undefined
    return {
      id: row.id as string,
      kind: 'client_request',
      title: meta?.name || 'Consultation request',
      category: (row.category as string) || meta?.specialization || null,
      appointmentDate: (row.appointment_date as string) || null,
      appointmentTime: (row.appointment_time as string) || null,
      createdAt: (row.created_at as string) || null,
      location: [row.city, row.state].filter(Boolean).join(', ') || null,
      professionalName: meta?.name || null,
      hasPrescription: Boolean(row.prescription_html),
      prescriptionUpdatedAt: (row.prescription_updated_at as string) || null,
      prescriptionHighlights: buildPrescriptionHighlights(row.prescription_html as string),
    }
  })

  return {
    success: true as const,
    isAuthenticated: true,
    role,
    userId: user.id,
    displayName,
    appointments,
  }
}
