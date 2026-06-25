export type ConsultationMeetingTitleInput = {
  category?: string | null
  professionalName: string
  professionalEmail?: string
}

const MEETING_TITLE_MAX_LENGTH = 120

function truncateMeetingTitle(title: string): string {
  return title.length > MEETING_TITLE_MAX_LENGTH
    ? `${title.slice(0, MEETING_TITLE_MAX_LENGTH - 1).trimEnd()}…`
    : title
}

/** Google Calendar / ICS title — includes consultant name for shared calendars. */
export function buildConsultationMeetingTitle(input: ConsultationMeetingTitleInput): string {
  const category = input.category?.trim()
  const consultant =
    input.professionalName.trim() &&
    (!input.professionalEmail || input.professionalName.trim() !== input.professionalEmail)
      ? input.professionalName.trim()
      : input.professionalEmail?.trim() || 'consultant'

  const title = category
    ? `${category} consultation with ${consultant}`
    : `Consultation with ${consultant}`

  return truncateMeetingTitle(title)
}

/** Professional dashboard schedule — patient-focused (no consultant name). */
export function buildProfessionalScheduleTitle(input: {
  category?: string | null
  patientName: string
}): string {
  const category = input.category?.trim()
  const patient = input.patientName.trim() || 'Patient'
  const title = category ? `${category} · ${patient}` : patient
  return truncateMeetingTitle(title)
}
