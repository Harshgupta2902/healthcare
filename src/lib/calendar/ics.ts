/** Format a Date as ICS UTC: YYYYMMDDTHHmmssZ */
export function formatIcsUtc(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const h = String(d.getUTCHours()).padStart(2, '0')
  const min = String(d.getUTCMinutes()).padStart(2, '0')
  const s = String(d.getUTCSeconds()).padStart(2, '0')
  return `${y}${m}${day}T${h}${min}${s}Z`
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

export function buildConsultationIcs(params: {
  uid: string
  title: string
  description: string
  location: string
  start: Date
  end: Date
  organizerEmail: string
  organizerName: string
  attendeeEmails: string[]
}): string {
  const now = formatIcsUtc(new Date())
  const dtStart = formatIcsUtc(params.start)
  const dtEnd = formatIcsUtc(params.end)
  const organizer = escapeIcsText(params.organizerName)

  const attendeeLines = params.attendeeEmails.map(
    (email) =>
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${email}:mailto:${email}`
  )

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HealthHere//Consultation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(params.title)}`,
    `DESCRIPTION:${escapeIcsText(params.description)}`,
    `LOCATION:${escapeIcsText(params.location)}`,
    `URL:${params.location}`,
    `ORGANIZER;CN=${organizer}:mailto:${params.organizerEmail}`,
    ...attendeeLines,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.join('\r\n')
}
