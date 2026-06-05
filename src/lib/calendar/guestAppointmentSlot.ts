import { format, formatDistanceToNow } from 'date-fns'
import { guestSlotToUtcDates } from '@/lib/calendar/generateGoogleCalendarLink'

export function getGuestSlotStart(appointmentDate: string, appointmentTime: string): Date {
  return guestSlotToUtcDates(appointmentDate, appointmentTime).start
}

export function isGuestSlotInFuture(
  appointmentDate: string,
  appointmentTime: string,
  now: Date = new Date(),
): boolean {
  return getGuestSlotStart(appointmentDate, appointmentTime).getTime() > now.getTime()
}

function formatGuestSlotLabel(appointmentDate: string, appointmentTime: string): string {
  try {
    const d = new Date(`${appointmentDate}T12:00:00`)
    const dateLabel = format(d, 'EEEE, MMMM d, yyyy')
    return `${dateLabel} at ${appointmentTime} (India Standard Time)`
  } catch {
    return `${appointmentDate} at ${appointmentTime}`
  }
}

export function buildPastGuestSlotMessage(appointmentDate: string, appointmentTime: string): string {
  const start = getGuestSlotStart(appointmentDate, appointmentTime)
  const slotLabel = formatGuestSlotLabel(appointmentDate, appointmentTime)
  const ago = formatDistanceToNow(start, { addSuffix: true })
  return `This request is for ${slotLabel}, which was ${ago}. Update the date and time before creating a meeting link, or cancel and leave it unchanged.`
}

export function assertGuestSlotIsFuture(appointmentDate: string, appointmentTime: string): void {
  if (!isGuestSlotInFuture(appointmentDate, appointmentTime)) {
    throw new Error(buildPastGuestSlotMessage(appointmentDate, appointmentTime))
  }
}
