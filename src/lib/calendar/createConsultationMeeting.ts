import 'server-only'

import { format } from 'date-fns'
import { createGoogleCalendarMeetEvent } from '@/lib/calendar/googleCalendarApi'
import { buildConsultationIcs } from '@/lib/calendar/ics'
import { guestSlotToUtcDates } from '@/lib/calendar/generateGoogleCalendarLink'
import { sendConsultationMeetingInviteEmails } from '@/lib/mailer'

export type ConsultationMeetingResult = {
  meetUrl: string
  provider: 'google' | 'jitsi'
  invitesSent: boolean
}

function buildJitsiMeetUrl(guestAppointmentId: string): string {
  const slug = guestAppointmentId.replace(/-/g, '').slice(0, 12)
  return `https://meet.jit.si/HealthHere-${slug}`
}

function formatSlotLabel(appointmentDate: string, appointmentTime: string): string {
  try {
    const d = new Date(`${appointmentDate}T12:00:00`)
    const dateLabel = format(d, 'EEEE, MMMM d, yyyy')
    return `${dateLabel} at ${appointmentTime} (India Standard Time)`
  } catch {
    return `${appointmentDate} at ${appointmentTime}`
  }
}

export async function createConsultationMeeting(params: {
  guestAppointmentId: string
  guestName: string
  guestEmail: string
  professionalName: string
  professionalEmail: string
  appointmentDate: string
  appointmentTime: string
}): Promise<ConsultationMeetingResult> {
  const { start, end } = guestSlotToUtcDates(params.appointmentDate, params.appointmentTime)
  const title = 'HealthHere Consultation'
  const attendeeEmails = [params.guestEmail, params.professionalEmail]
  const slotLabel = formatSlotLabel(params.appointmentDate, params.appointmentTime)

  const google = await createGoogleCalendarMeetEvent({
    title,
    start,
    end,
    attendeeEmails,
  })

  if (google) {
    return {
      meetUrl: google.meetUrl,
      provider: 'google',
      invitesSent: true,
    }
  }

  const meetUrl = buildJitsiMeetUrl(params.guestAppointmentId)
  const description = [
    `Video consultation for ${params.guestName.trim() || 'patient'}.`,
    '',
    `Join meeting: ${meetUrl}`,
    '',
    `Scheduled: ${slotLabel}`,
  ].join('\n')

  const ics = buildConsultationIcs({
    uid: `${params.guestAppointmentId}@healthhere.com`,
    title,
    description,
    location: meetUrl,
    start,
    end,
    organizerEmail: process.env.SMTP_USER || 'noreply@healthhere.com',
    organizerName: process.env.SMTP_FROM_NAME || 'HealthHere',
    attendeeEmails,
  })

  await sendConsultationMeetingInviteEmails({
    meetUrl,
    slotLabel,
    guestName: params.guestName,
    guestEmail: params.guestEmail,
    professionalName: params.professionalName,
    professionalEmail: params.professionalEmail,
    icsContent: ics,
    icsFilename: `healthhere-consultation-${params.guestAppointmentId.slice(0, 8)}.ics`,
  })

  return {
    meetUrl,
    provider: 'jitsi',
    invitesSent: true,
  }
}
