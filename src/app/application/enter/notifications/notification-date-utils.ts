import { format } from 'date-fns'

export function todayDateOnly(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Server query bounds: today when URL has no user-selected range. */
export function resolveNotificationQueryDates(urlFrom?: string, urlTo?: string) {
  const today = todayDateOnly()
  const hasUserFilter = Boolean(urlFrom || urlTo)
  if (!hasUserFilter) {
    return { from: today, to: today, hasUserFilter: false as const }
  }
  return {
    from: urlFrom ?? today,
    to: urlTo ?? urlFrom ?? today,
    hasUserFilter: true as const,
  }
}
