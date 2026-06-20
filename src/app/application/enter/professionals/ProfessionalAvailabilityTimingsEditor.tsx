'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getProfessionalAvailabilityForAdmin,
  updateProfessionalAvailabilityTimings,
  type AdminAvailabilitySlot,
} from '@/features/admin/actions'

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

type TimingDraft = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

type ProfessionalAvailabilityTimingsEditorProps = {
  professionalUserId: string
}

export function ProfessionalAvailabilityTimingsEditor({
  professionalUserId,
}: ProfessionalAvailabilityTimingsEditorProps) {
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<TimingDraft[]>([])
  const [isPending, startTransition] = useTransition()

  const loadSlots = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getProfessionalAvailabilityForAdmin(professionalUserId)
      if (!result.success) {
        toast.error(result.error)
        setSlots([])
        return
      }
      setSlots(
        result.slots.map((row: AdminAvailabilitySlot) => ({
          id: row.id,
          dayOfWeek: row.dayOfWeek,
          startTime: row.startTime,
          endTime: row.endTime,
        })),
      )
    } finally {
      setLoading(false)
    }
  }, [professionalUserId])

  useEffect(() => {
    void loadSlots()
  }, [loadSlots])

  const updateSlotTime = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const handleSaveTimings = () => {
    startTransition(async () => {
      const result = await updateProfessionalAvailabilityTimings({
        professionalUserId,
        slots: slots.map((s) => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Weekly timings updated')
      await loadSlots()
    })
  }

  return (
    <div className="space-y-4 rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-low/40 p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-lp-brand" aria-hidden />
          <Label className="font-heading text-sm font-semibold text-lp-on-surface">
            Weekly availability timings
          </Label>
        </div>
        <p className="font-sans text-xs text-lp-on-surface-variant">
          Edit start and end times only. Days are managed by the professional in their dashboard.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-lp-brand" aria-hidden />
        </div>
      ) : slots.length === 0 ? (
        <p className="rounded-lg border border-dashed border-lp-outline-variant/40 px-4 py-6 text-center font-sans text-sm text-lp-on-surface-variant">
          No weekly schedule set yet. The professional can add days from their dashboard.
        </p>
      ) : (
        <ul className="space-y-3">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="grid grid-cols-1 gap-3 rounded-lg border border-lp-outline-variant/25 bg-lp-surface-container-lowest p-3 sm:grid-cols-[7rem_1fr_1fr]"
            >
              <span className="font-heading text-sm font-semibold text-lp-on-surface sm:pt-2">
                {DAYS_OF_WEEK[slot.dayOfWeek] ?? 'Day'}
              </span>
              <div className="space-y-1">
                <Label htmlFor={`start-${slot.id}`} className="text-xs text-lp-on-surface-variant">
                  Start
                </Label>
                <Input
                  id={`start-${slot.id}`}
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlotTime(slot.id, 'startTime', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`end-${slot.id}`} className="text-xs text-lp-on-surface-variant">
                  End
                </Label>
                <Input
                  id={`end-${slot.id}`}
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlotTime(slot.id, 'endTime', e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {slots.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          disabled={isPending || loading}
          onClick={handleSaveTimings}
          className="w-full rounded-xl sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Saving timings…
            </>
          ) : (
            'Save timings'
          )}
        </Button>
      ) : null}
    </div>
  )
}
