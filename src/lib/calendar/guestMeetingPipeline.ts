import 'server-only'

import { format } from 'date-fns'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createGoogleCalendarMeetEvent } from '@/lib/calendar/googleCalendarApi'
import { buildConsultationIcs } from '@/lib/calendar/ics'
import { assertGuestSlotIsFuture } from '@/lib/calendar/guestAppointmentSlot'
import { guestSlotToUtcDatesWithMeetingEnd } from '@/lib/calendar/generateGoogleCalendarLink'
import {
  sendConsultationMeetingInviteToGuest,
  sendConsultationMeetingInviteToProfessional,
} from '@/lib/mailer'
import { buildConsultationMeetingTitle } from '@/lib/calendar/consultationMeetingTitle'

export type GuestMeetingContext = {
  guestAppointmentId: string
  guestName: string
  guestEmail: string
  category: string | null
  professionalName: string
  professionalEmail: string
  appointmentDate: string
  appointmentTime: string
  meetingDurationMinutes?: number | null
  meetingEndTime?: string | null
}

export type MeetingProvider = 'google' | 'jitsi'

export function meetingTitleForContext(ctx: GuestMeetingContext): string {
  return buildConsultationMeetingTitle({
    category: ctx.category,
    professionalName: ctx.professionalName,
    professionalEmail: ctx.professionalEmail,
  })
}

export function buildJitsiMeetUrl(guestAppointmentId: string): string {
  const slug = guestAppointmentId.replace(/-/g, '').slice(0, 12)
  return `https://meet.jit.si/Protealth-${slug}`
}

export function formatSlotLabel(appointmentDate: string, appointmentTime: string): string {
  try {
    const d = new Date(`${appointmentDate}T12:00:00`)
    const dateLabel = format(d, 'EEEE, MMMM d, yyyy')
    return `${dateLabel} at ${appointmentTime} (India Standard Time)`
  } catch {
    return `${appointmentDate} at ${appointmentTime}`
  }
}

export async function loadGuestMeetingContext(
  supabase: SupabaseClient,
  guestAppointmentId: string,
): Promise<GuestMeetingContext> {
  const { data: row, error: readErr } = await supabase
    .from('guest_appointments')
    .select(
      'id, first_name, last_name, email, category, appointment_date, appointment_time, meeting_duration_minutes, meeting_end_time, calendar_invite_url, professional_id',
    )
    .eq('id', guestAppointmentId)
    .maybeSingle()

  if (readErr) throw new Error(readErr.message)
  if (!row) throw new Error('Appointment not found.')
  if (row.calendar_invite_url?.trim()) {
    throw new Error('A meeting link already exists for this appointment.')
  }

  const guestEmail = (row.email as string)?.trim()
  if (!guestEmail) throw new Error('Patient email is missing on this request.')

  const professionalId = row.professional_id as string | null
  if (!professionalId) {
    throw new Error('Assign a consultant before creating a meeting.')
  }

  const { data: prof, error: profErr } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', professionalId)
    .maybeSingle()

  if (profErr) throw new Error(profErr.message)
  const profEmail = (prof?.email as string | undefined)?.trim()
  if (!profEmail) throw new Error('Consultant email is missing.')

  const appointmentDate = row.appointment_date as string
  const appointmentTime = row.appointment_time as string
  const meetingDurationMinutes = (row.meeting_duration_minutes as number | null) ?? null
  const meetingEndTime = (row.meeting_end_time as string | null) ?? null
  assertGuestSlotIsFuture(appointmentDate, appointmentTime)

  return {
    guestAppointmentId,
    guestName: `${row.first_name} ${row.last_name}`.trim(),
    guestEmail,
    category: (row.category as string | null) ?? null,
    professionalName: (prof?.name as string | null) || profEmail,
    professionalEmail: profEmail,
    appointmentDate,
    appointmentTime,
    meetingDurationMinutes,
    meetingEndTime,
  }
}

export function assertMeetUrlForAppointment(
  guestAppointmentId: string,
  meetUrl: string,
  provider: MeetingProvider,
): void {
  const trimmed = meetUrl.trim()
  if (provider === 'jitsi') {
    const expected = buildJitsiMeetUrl(guestAppointmentId)
    if (trimmed !== expected) {
      throw new Error('Meeting link does not match the expected Jitsi room for this appointment.')
    }
    return
  }
  if (!trimmed.includes('meet.google.com') && !trimmed.includes('google.com')) {
    throw new Error('Invalid Google Meet link.')
  }
}

function getMeetingUtcRange(ctx: GuestMeetingContext): { start: Date; end: Date } {
  const duration = ctx.meetingDurationMinutes ?? 60
  return guestSlotToUtcDatesWithMeetingEnd(
    ctx.appointmentDate,
    ctx.appointmentTime,
    ctx.meetingEndTime,
    duration,
  )
}

export async function generateGuestMeetingLink(
  ctx: GuestMeetingContext,
): Promise<{ meetUrl: string; provider: MeetingProvider }> {
  const { start, end } = getMeetingUtcRange(ctx)
  const title = meetingTitleForContext(ctx)
  const attendeeEmails = [ctx.guestEmail, ctx.professionalEmail]

  const google = await createGoogleCalendarMeetEvent({
    title,
    start,
    end,
    attendeeEmails,
  })

  if (google) {
    return { meetUrl: google.meetUrl, provider: 'google' }
  }

  return {
    meetUrl: buildJitsiMeetUrl(ctx.guestAppointmentId),
    provider: 'jitsi',
  }
}

function buildIcsForMeeting(ctx: GuestMeetingContext, meetUrl: string): string {
  const { start, end } = getMeetingUtcRange(ctx)
  const slotLabel = formatSlotLabel(ctx.appointmentDate, ctx.appointmentTime)
  const title = meetingTitleForContext(ctx)
  const description = [
    title,
    '',
    `Patient: ${ctx.guestName.trim() || 'patient'}`,
    `Consultant: ${ctx.professionalName}`,
    ctx.category?.trim() ? `Type: ${ctx.category.trim()}` : null,
    '',
    `Join meeting: ${meetUrl}`,
    '',
    `Scheduled: ${slotLabel}`,
  ]
    .filter((line): line is string => line != null)
    .join('\n')

  return buildConsultationIcs({
    uid: `${ctx.guestAppointmentId}@protealth.com`,
    title,
    description,
    location: meetUrl,
    start,
    end,
    organizerEmail: process.env.SMTP_USER || 'noreply@protealth.com',
    organizerName: process.env.SMTP_FROM_NAME || 'Protealth',
    attendeeEmails: [ctx.guestEmail, ctx.professionalEmail],
  })
}

export async function emailGuestMeetingInvitePatient(
  ctx: GuestMeetingContext,
  meetUrl: string,
): Promise<void> {
  const slotLabel = formatSlotLabel(ctx.appointmentDate, ctx.appointmentTime)
  const ics = buildIcsForMeeting(ctx, meetUrl)
  await sendConsultationMeetingInviteToGuest({
    meetUrl,
    slotLabel,
    guestName: ctx.guestName,
    guestEmail: ctx.guestEmail,
    professionalName: ctx.professionalName,
    icsContent: ics,
    icsFilename: `protealth-consultation-${ctx.guestAppointmentId.slice(0, 8)}.ics`,
  })
}

export async function emailGuestMeetingInviteConsultant(
  ctx: GuestMeetingContext,
  meetUrl: string,
): Promise<void> {
  const slotLabel = formatSlotLabel(ctx.appointmentDate, ctx.appointmentTime)
  const ics = buildIcsForMeeting(ctx, meetUrl)
  await sendConsultationMeetingInviteToProfessional({
    meetUrl,
    slotLabel,
    guestName: ctx.guestName,
    professionalEmail: ctx.professionalEmail,
    icsContent: ics,
    icsFilename: `protealth-consultation-${ctx.guestAppointmentId.slice(0, 8)}.ics`,
  })
}

export async function saveGuestMeetingUrl(
  supabase: SupabaseClient,
  guestAppointmentId: string,
  meetUrl: string,
  meetingTitle?: string,
): Promise<void> {
  let title = meetingTitle?.trim()
  if (!title) {
    title = await resolveGuestMeetingTitle(supabase, guestAppointmentId)
  }

  const { error } = await supabase
    .from('guest_appointments')
    .update({
      calendar_invite_url: meetUrl.trim(),
      meeting_title: title,
    })
    .eq('id', guestAppointmentId)

  if (error) throw new Error(error.message)
}

async function resolveGuestMeetingTitle(
  supabase: SupabaseClient,
  guestAppointmentId: string,
): Promise<string> {
  const { data: row, error } = await supabase
    .from('guest_appointments')
    .select('category, professional_id')
    .eq('id', guestAppointmentId)
    .maybeSingle()

  if (error || !row) {
    return buildConsultationMeetingTitle({ category: null, professionalName: 'consultant' })
  }

  let professionalName = 'consultant'
  let professionalEmail: string | undefined
  if (row.professional_id) {
    const { data: prof } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', row.professional_id as string)
      .maybeSingle()
    professionalName = (prof?.name as string | null)?.trim() || (prof?.email as string | null)?.trim() || 'consultant'
    professionalEmail = (prof?.email as string | undefined)?.trim()
  }

  return buildConsultationMeetingTitle({
    category: (row.category as string | null) ?? null,
    professionalName,
    professionalEmail,
  })
}
