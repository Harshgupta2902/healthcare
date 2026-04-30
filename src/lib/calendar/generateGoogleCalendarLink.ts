/**
 * Builds a Google Calendar "create event" URL (no API / OAuth).
 * Times must be UTC instants; `start`/`end` are formatted as YYYYMMDDTHHmmssZ.
 * Attendees are passed as repeated `add` query params.
 *
 * **Important:** Google always opens a **draft** (you must click **Save**). There is no
 * supported URL parameter to skip that step — it is intentional (spam / consent). To
 * create events without that screen you need the **Google Calendar API** with OAuth.
 */
export function formatGoogleCalendarUtc(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const h = String(d.getUTCHours()).padStart(2, '0')
  const min = String(d.getUTCMinutes()).padStart(2, '0')
  const s = String(d.getUTCSeconds()).padStart(2, '0')
  return `${y}${m}${day}T${h}${min}${s}Z`
}

/** Interpret guest slot as Asia/Kolkata wall time (no DST). */
export function guestSlotToUtcDates(appointmentDate: string, appointmentTime: string): { start: Date; end: Date } {
  const raw = (appointmentTime || '09:00').trim()
  const [hRaw, mRaw = '00'] = raw.split(':')
  const hh = String(Math.min(23, Math.max(0, parseInt(hRaw || '9', 10)))).padStart(2, '0')
  const mm = String(Math.min(59, Math.max(0, parseInt(mRaw.slice(0, 2) || '0', 10)))).padStart(2, '0')
  const isoLocal = `${appointmentDate}T${hh}:${mm}`
  const start = new Date(`${isoLocal}:00+05:30`)
  if (Number.isNaN(start.getTime())) {
    throw new Error('Invalid appointment date or time')
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  return { start, end }
}

function normalizeAttendeeEmails(rawList: string[]): string[] {
  const seen = new Set<string>()
  const emails: string[] = []
  for (const raw of rawList) {
    const e = raw.trim().toLowerCase()
    if (!e || !e.includes('@') || seen.has(e)) continue
    seen.add(e)
    emails.push(e)
  }
  return emails
}

export function generateGoogleCalendarLink(params: {
  title: string
  start: Date
  end: Date
  attendeeEmails: string[]
}): string {
  const emails = normalizeAttendeeEmails(params.attendeeEmails)

  const dates = `${formatGoogleCalendarUtc(params.start)}/${formatGoogleCalendarUtc(params.end)}`
  const q = new URLSearchParams()
  q.set('action', 'TEMPLATE')
  q.set('text', params.title)
  q.set('dates', dates)
  for (const email of emails) {
    q.append('add', email)
  }
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
