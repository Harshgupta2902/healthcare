import 'server-only'

import {
  emailGuestMeetingInviteConsultant,
  emailGuestMeetingInvitePatient,
  generateGuestMeetingLink,
  type GuestMeetingContext,
} from '@/lib/calendar/guestMeetingPipeline'

export type ConsultationMeetingResult = {
  meetUrl: string
  provider: 'google' | 'jitsi'
  invitesSent: boolean
}

export async function createConsultationMeeting(
  params: GuestMeetingContext,
): Promise<ConsultationMeetingResult> {
  const { meetUrl, provider } = await generateGuestMeetingLink(params)

  if (provider === 'google') {
    return { meetUrl, provider, invitesSent: true }
  }

  await emailGuestMeetingInvitePatient(params, meetUrl)
  await emailGuestMeetingInviteConsultant(params, meetUrl)

  return { meetUrl, provider, invitesSent: true }
}
