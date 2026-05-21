'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { CalendarRange, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { adminTheme } from '../_components/admin-theme'
import { todayDateOnly } from './notification-date-utils'

interface NotificationDateFilterProps {
  /** Set only when the user applied a range (present in URL). */
  urlFrom?: string
  urlTo?: string
}

function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined
  const d = parseISO(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toDateOnlyString(date?: Date): string | undefined {
  if (!date) return undefined
  return format(date, 'yyyy-MM-dd')
}

function rangeFromDates(from?: string, to?: string): DateRange | undefined {
  const fromDate = parseDateOnly(from)
  const toDate = parseDateOnly(to)
  if (!fromDate && !toDate) return undefined
  return { from: fromDate, to: toDate }
}

function formatRangeLabel(from: string, to: string): string {
  const fromLabel = format(parseISO(from), 'MMM d, yyyy')
  const toLabel = format(parseISO(to), 'MMM d, yyyy')
  if (fromLabel === toLabel) return fromLabel
  return `${fromLabel} – ${toLabel}`
}

export function NotificationDateFilter({ urlFrom, urlTo }: NotificationDateFilterProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const today = useMemo(() => todayDateOnly(), [])
  const displayFrom = urlFrom ?? today
  const displayTo = urlTo ?? today
  const hasUserFilter = Boolean(urlFrom || urlTo)

  const [range, setRange] = useState<DateRange | undefined>(() =>
    rangeFromDates(displayFrom, displayTo)
  )

  useEffect(() => {
    setRange(rangeFromDates(urlFrom ?? today, urlTo ?? today))
  }, [urlFrom, urlTo, today])

  const triggerLabel = useMemo(
    () => formatRangeLabel(displayFrom, displayTo),
    [displayFrom, displayTo]
  )
  const canApply = Boolean(range?.from || range?.to)

  const applyFilter = () => {
    const fromStr = toDateOnlyString(range?.from)
    const toStr = toDateOnlyString(range?.to ?? range?.from)
    if (!fromStr || !toStr || fromStr > toStr) return

    setOpen(false)

    if (fromStr === today && toStr === today) {
      router.push('/application/enter/notifications')
      return
    }

    const params = new URLSearchParams()
    params.set('from', fromStr)
    params.set('to', toStr)
    router.push(`/application/enter/notifications?${params.toString()}`)
  }

  const clearFilter = () => {
    setRange(rangeFromDates(today, today))
    setOpen(false)
    router.push('/application/enter/notifications')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-9 max-w-[min(100%,14rem)] justify-start gap-2 rounded-xl border-lp-outline-variant/40 font-normal sm:max-w-none sm:min-w-[10rem]',
              hasUserFilter && 'border-lp-brand/40 text-lp-on-surface'
            )}
          >
            <CalendarRange className="h-4 w-4 shrink-0 text-lp-brand" />
            <span className="truncate">{triggerLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="liquid-glass-strong w-auto rounded-2xl border-white/60 p-0 dark:border-white/10"
        >
          <Calendar
            mode="range"
            defaultMonth={range?.from ?? range?.to ?? new Date()}
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
          <div className="flex items-center justify-end gap-2 border-t border-lp-outline-variant/25 p-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-lg"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canApply}
              className={adminTheme.ctaButton}
              onClick={applyFilter}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasUserFilter ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearFilter}
          className="h-9 gap-1 rounded-xl border-lp-outline-variant/40 px-2.5"
          aria-label="Reset to today"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
