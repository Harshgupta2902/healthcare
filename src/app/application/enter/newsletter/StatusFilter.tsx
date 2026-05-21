'use client'

import { useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

export type SubscriberStatus = 'active' | 'resubscribed' | 'unsubscribed'

const OPTIONS: { value: SubscriberStatus; label: string; description: string }[] = [
  { value: 'active', label: 'Active', description: 'Subscribed and receiving emails' },
  { value: 'resubscribed', label: 'Resubscribed', description: 'Re-opted in after unsubscribing' },
  { value: 'unsubscribed', label: 'Unsubscribed', description: 'Opted out, hidden by default' },
]

const DEFAULT_STATUSES: SubscriberStatus[] = ['active', 'resubscribed']

interface StatusFilterProps {
  value: SubscriberStatus[]
  onChange: (next: SubscriberStatus[]) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const [open, setOpen] = useState(false)

  const isDefault = useMemo(() => {
    if (value.length !== DEFAULT_STATUSES.length) return false
    const set = new Set(value)
    return DEFAULT_STATUSES.every((s) => set.has(s))
  }, [value])

  const toggle = (status: SubscriberStatus, checked: boolean) => {
    const next = new Set(value)
    if (checked) next.add(status)
    else next.delete(status)
    if (next.size === 0) {
      onChange(DEFAULT_STATUSES)
      return
    }
    const ordered = OPTIONS.map((o) => o.value).filter((v) => next.has(v))
    onChange(ordered)
  }

  const reset = () => onChange(DEFAULT_STATUSES)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl gap-2 border-lp-outline-variant/40 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 h-9"
          aria-label="Filter by status"
        >
          <Filter className="w-4 h-4" />
          <span>Status</span>
          {!isDefault && (
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0 text-[10px] leading-4 bg-lp-surface-container text-lp-brand text-lp-brand dark:text-lp-brand-bright"
            >
              {value.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Filter by status</p>
          <button
            type="button"
            onClick={reset}
            className="text-[11px] text-lp-brand hover:underline disabled:opacity-50 dark:text-lp-brand-bright"
            disabled={isDefault}
          >
            Reset
          </button>
        </div>
        <div className="space-y-1.5">
          {OPTIONS.map((opt) => {
            const checked = value.includes(opt.value)
            return (
              <label
                key={opt.value}
                className="flex items-start gap-2.5 rounded-lg p-2 cursor-pointer hover:bg-lp-surface-container/80 dark:hover:bg-white/5"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => toggle(opt.value, c === true)}
                  className="mt-0.5"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {opt.description}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
