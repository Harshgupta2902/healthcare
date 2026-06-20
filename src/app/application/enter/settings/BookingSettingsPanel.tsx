'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarClock, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateBookingSettings } from '@/features/admin/actions'
import {
  BOOKING_ADVANCE_WEEKS_OPTIONS,
  MEETING_DURATION_OPTIONS,
  type BookingSettings,
} from '@/lib/booking-settings'
import { cn } from '@/lib/utils'
import { adminTheme } from '../_components/admin-theme'

const bookingFormSchema = z.object({
  slot_hold_minutes: z.coerce.number().int().min(5).max(30),
  meeting_duration_minutes: z.coerce
    .number()
    .int()
    .refine((v) => MEETING_DURATION_OPTIONS.includes(v as (typeof MEETING_DURATION_OPTIONS)[number]), {
      message: 'Choose 30, 40, 50, or 60 minutes.',
    }),
  booking_advance_weeks: z.coerce
    .number()
    .int()
    .refine((v) => BOOKING_ADVANCE_WEEKS_OPTIONS.includes(v as (typeof BOOKING_ADVANCE_WEEKS_OPTIONS)[number]), {
      message: 'Choose 1, 2, or 3 weeks.',
    }),
})

type BookingFormValues = z.infer<typeof bookingFormSchema>

type BookingSettingsPanelProps = {
  settings: BookingSettings
  updatedAt: string | null
}

function formatUpdatedAt(value: string | null) {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return null
  }
}

export function BookingSettingsPanel({ settings, updatedAt }: BookingSettingsPanelProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      slot_hold_minutes: settings.slot_hold_minutes,
      meeting_duration_minutes: settings.meeting_duration_minutes,
      booking_advance_weeks: settings.booking_advance_weeks,
    },
  })

  useEffect(() => {
    form.reset({
      slot_hold_minutes: settings.slot_hold_minutes,
      meeting_duration_minutes: settings.meeting_duration_minutes,
      booking_advance_weeks: settings.booking_advance_weeks,
    })
  }, [form, settings])

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateBookingSettings(values)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Booking settings saved')
      router.refresh()
    })
  })

  const updatedLabel = formatUpdatedAt(updatedAt)

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="liquid-glass rounded-2xl border border-white/50 p-6 shadow-lg dark:border-white/10"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-lp-brand/10 text-lp-brand">
          <CalendarClock className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold text-lp-on-surface">Booking &amp; slots</h2>
          <p className="mt-1 font-sans text-sm text-lp-on-surface-variant">
            Hourly slots are shown as 1-hour windows (e.g. 10–11). Meeting length applies when the consultation is
            created.
          </p>
          {updatedLabel ? (
            <p className="mt-2 font-sans text-xs text-lp-on-surface-variant">Last updated {updatedLabel}</p>
          ) : null}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="slot_hold_minutes" className="font-sans text-sm font-medium text-lp-on-surface">
              Slot hold (minutes)
            </Label>
            <p className="font-sans text-xs text-lp-on-surface-variant">
              How long an incomplete booking blocks the hourly slot before it opens again.
            </p>
            <Input
              id="slot_hold_minutes"
              type="number"
              min={5}
              max={30}
              disabled={pending}
              className={cn(adminTheme.input, 'h-10')}
              {...form.register('slot_hold_minutes')}
            />
            {form.formState.errors.slot_hold_minutes ? (
              <p className="text-xs text-red-600">{form.formState.errors.slot_hold_minutes.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_duration_minutes" className="font-sans text-sm font-medium text-lp-on-surface">
              Meeting duration (minutes)
            </Label>
            <p className="font-sans text-xs text-lp-on-surface-variant">
              Actual consultation length when a meeting is created (max 60).
            </p>
            <select
              id="meeting_duration_minutes"
              disabled={pending}
              className={cn(adminTheme.input, 'h-10 w-full')}
              {...form.register('meeting_duration_minutes')}
            >
              {MEETING_DURATION_OPTIONS.map((mins) => (
                <option key={mins} value={mins}>
                  {mins} minutes
                </option>
              ))}
            </select>
            {form.formState.errors.meeting_duration_minutes ? (
              <p className="text-xs text-red-600">{form.formState.errors.meeting_duration_minutes.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_advance_weeks" className="font-sans text-sm font-medium text-lp-on-surface">
              Booking window (weeks)
            </Label>
            <p className="font-sans text-xs text-lp-on-surface-variant">
              How far ahead patients can book (1, 2, or 3 weeks from today).
            </p>
            <select
              id="booking_advance_weeks"
              disabled={pending}
              className={cn(adminTheme.input, 'h-10 w-full')}
              {...form.register('booking_advance_weeks')}
            >
              {BOOKING_ADVANCE_WEEKS_OPTIONS.map((weeks) => (
                <option key={weeks} value={weeks}>
                  {weeks} week{weeks > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            {form.formState.errors.booking_advance_weeks ? (
              <p className="text-xs text-red-600">{form.formState.errors.booking_advance_weeks.message}</p>
            ) : null}
          </div>
        </div>

        <Button type="submit" disabled={pending} className={adminTheme.ctaButton}>
          {pending ? (
            'Saving…'
          ) : (
            <>
              <Save className="size-4" aria-hidden />
              Save booking settings
            </>
          )}
        </Button>
      </form>
    </motion.section>
  )
}
