import 'server-only'

import { randomUUID } from 'crypto'

export type GoogleMeetEventResult = {
  meetUrl: string
  htmlLink: string
}

function googleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim() &&
      process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim()
  )
}

/**
 * Creates a Google Calendar event with a Google Meet link and emails invites to attendees.
 *
 * Required env (one-time OAuth setup in Google Cloud Console + Calendar API enabled):
 * - GOOGLE_CALENDAR_CLIENT_ID
 * - GOOGLE_CALENDAR_CLIENT_SECRET
 * - GOOGLE_CALENDAR_REFRESH_TOKEN
 * Optional:
 * - GOOGLE_CALENDAR_ID (default: primary)
 */
export async function createGoogleCalendarMeetEvent(params: {
  title: string
  start: Date
  end: Date
  attendeeEmails: string[]
  timeZone?: string
}): Promise<GoogleMeetEventResult | null> {
  if (!googleCalendarConfigured()) return null

  const { google } = await import('googleapis')

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  )
  oauth2.setCredentials({
    refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2 })
  const timeZone = params.timeZone || 'Asia/Kolkata'
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary'

  const attendees = params.attendeeEmails.map((email) => ({ email: email.trim().toLowerCase() }))

  const { data } = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
      summary: params.title,
      start: { dateTime: params.start.toISOString(), timeZone },
      end: { dateTime: params.end.toISOString(), timeZone },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  })

  const meetUrl =
    data.hangoutLink ||
    data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ||
    ''

  if (!meetUrl) {
    throw new Error('Google Calendar event was created but no Meet link was returned.')
  }

  return {
    meetUrl,
    htmlLink: data.htmlLink || meetUrl,
  }
}
