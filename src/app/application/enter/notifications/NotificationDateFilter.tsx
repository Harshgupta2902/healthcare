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

interface NotificationDateFilterProps {
  from?: string
  to?: string
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

function rangeFromUrl(from?: string, to?: string): DateRange | undefined {
  const fromDate = parseDateOnly(from)
  const toDate = parseDateOnly(to)
  if (!fromDate && !toDate) return undefined
  return { from: fromDate, to: toDate }
}

function formatRangeLabel(from?: string, to?: string): string {
  if (!from && !to) return 'Date range'
  const fromLabel = from ? format(parseISO(from), 'MMM d, yyyy') : null
  const toLabel = to ? format(parseISO(to), 'MMM d, yyyy') : null
  if (fromLabel && toLabel) return `${fromLabel} – ${toLabel}`
  if (fromLabel) return `From ${fromLabel}`
  if (toLabel) return `Until ${toLabel}`
  return 'Date range'
}

export function NotificationDateFilter({ from, to }: NotificationDateFilterProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>(() => rangeFromUrl(from, to))
  const hasActiveFilter = Boolean(from || to)

  useEffect(() => {
    setRange(rangeFromUrl(from, to))
  }, [from, to])

  const triggerLabel = useMemo(() => formatRangeLabel(from, to), [from, to])
  const canApply = Boolean(range?.from || range?.to)

  const applyFilter = () => {
    const fromStr = toDateOnlyString(range?.from)
    const toStr = toDateOnlyString(range?.to ?? range?.from)
    if (fromStr && toStr && fromStr > toStr) return

    const params = new URLSearchParams()
    if (fromStr) params.set('from', fromStr)
    if (toStr) params.set('to', toStr)
    const q = params.toString()
    setOpen(false)
    router.push(q ? `/application/enter/notifications?${q}` : '/application/enter/notifications')
  }

  const clearFilter = () => {
    setRange(undefined)
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
              hasActiveFilter && 'border-lp-brand/40 text-lp-on-surface'
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

      {hasActiveFilter ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearFilter}
          className="h-9 gap-1 rounded-xl border-lp-outline-variant/40 px-2.5"
          aria-label="Clear date filter"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
