'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  guestMeetingValidateStep,
  guestMeetingCreateLinkStep,
  guestMeetingEmailPatientStep,
  guestMeetingEmailConsultantStep,
  guestMeetingSaveStep,
} from '@/features/admin/actions'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Copy, Loader2, MinusCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

/** Prevents duplicate pipelines (React Strict Mode remount / effect re-runs). */
const startedPipelineLocks = new Set<string>()

type StepStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped'

type MeetingStep = {
  id: string
  label: string
  detail?: string
  status: StepStatus
  durationMs?: number
  error?: string
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'running') {
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
  }
  if (status === 'done') {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
  }
  if (status === 'error') {
    return <XCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
  }
  if (status === 'skipped') {
    return <MinusCircle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
  }
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
}

export type CreateMeetingProgressDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  guestAppointmentId: string
  patientLabel: string
  /** Changes each time the user opens the dialog (one run per open). */
  sessionKey: number
  onComplete?: () => void
}

export function CreateMeetingProgressDialog({
  open,
  onOpenChange,
  guestAppointmentId,
  patientLabel,
  sessionKey,
  onComplete,
}: CreateMeetingProgressDialogProps) {
  const [steps, setSteps] = useState<MeetingStep[]>([])
  const [meetUrl, setMeetUrl] = useState<string | null>(null)
  const [providerLabel, setProviderLabel] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [pipelineDone, setPipelineDone] = useState(false)
  const [shouldRefreshOnClose, setShouldRefreshOnClose] = useState(false)
  const runIdRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const patchStep = useCallback((id: string, patch: Partial<MeetingStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const execStep = useCallback(
    async <T extends { success: boolean }>(
      id: string,
      fn: () => Promise<T>,
      detail?: (result: Extract<T, { success: true }>) => string | undefined,
    ): Promise<Extract<T, { success: true }> | null> => {
      const start = performance.now()
      patchStep(id, { status: 'running', error: undefined, detail: undefined })
      const res = await fn()
      const durationMs = performance.now() - start
      if (!res.success) {
        patchStep(id, {
          status: 'error',
          durationMs,
          error: 'error' in res && typeof res.error === 'string' ? res.error : 'Step failed',
        })
        return null
      }
      const ok = res as Extract<T, { success: true }>
      patchStep(id, {
        status: 'done',
        durationMs,
        detail: detail?.(ok),
      })
      return ok
    },
    [patchStep],
  )

  useEffect(() => {
    if (!open) return

    const lockKey = `${guestAppointmentId}:${sessionKey}`
    if (startedPipelineLocks.has(lockKey)) return
    startedPipelineLocks.add(lockKey)

    const runId = ++runIdRef.current
    setSteps([
      { id: 'validate', label: 'Validate appointment', status: 'pending' },
      { id: 'create-link', label: 'Create meeting link', status: 'pending' },
    ])
    setMeetUrl(null)
    setProviderLabel(null)
    setIsRunning(true)
    setPipelineDone(false)
    setShouldRefreshOnClose(false)

    const isStale = () => runId !== runIdRef.current

    ;(async () => {
      const validateRes = await execStep('validate', () =>
        guestMeetingValidateStep({ guestAppointmentId }),
      )
      if (isStale() || !validateRes) {
        setIsRunning(false)
        return
      }

      patchStep('validate', {
        detail: `${validateRes.patientName} · ${validateRes.consultantName}`,
      })

      const linkRes = await execStep(
        'create-link',
        () => guestMeetingCreateLinkStep({ guestAppointmentId }),
        (r) => r.providerLabel,
      )
      if (isStale() || !linkRes) {
        setIsRunning(false)
        return
      }

      const { meetUrl: url, provider, providerLabel: provLabel } = linkRes
      setMeetUrl(url)
      setProviderLabel(provLabel)

      const persistPayload = {
        guestAppointmentId,
        meetUrl: url,
        provider,
      }

      if (provider === 'google') {
        setSteps((prev) => [
          ...prev,
          {
            id: 'google-invites',
            label: 'Send calendar invites (Google)',
            status: 'pending',
          },
          { id: 'save', label: 'Save meeting link', status: 'pending' },
        ])

        const inviteDetail = `Invites sent to ${validateRes.patientEmail} and ${validateRes.consultantEmail}`
        await execStep('google-invites', async () => {
          return { success: true as const }
        }, () => inviteDetail)
        if (isStale()) return

        const saveRes = await execStep('save', () => guestMeetingSaveStep(persistPayload))
        if (isStale() || !saveRes) {
          setIsRunning(false)
          return
        }
      } else {
        setSteps((prev) => [
          ...prev,
          {
            id: 'email-patient',
            label: 'Email invite to patient',
            status: 'pending',
          },
          {
            id: 'email-consultant',
            label: 'Email invite to consultant',
            status: 'pending',
          },
          { id: 'save', label: 'Save meeting link', status: 'pending' },
        ])

        const patientRes = await execStep(
          'email-patient',
          () => guestMeetingEmailPatientStep(persistPayload),
          (r) => (r.skipped ? 'Skipped (Google path)' : `Sent to ${r.sentTo}`),
        )
        if (isStale() || !patientRes) {
          setIsRunning(false)
          return
        }

        const consultantRes = await execStep(
          'email-consultant',
          () => guestMeetingEmailConsultantStep(persistPayload),
          (r) => (r.skipped ? 'Skipped (Google path)' : `Sent to ${r.sentTo}`),
        )
        if (isStale() || !consultantRes) {
          setIsRunning(false)
          return
        }

        const saveRes = await execStep('save', () => guestMeetingSaveStep(persistPayload))
        if (isStale() || !saveRes) {
          setIsRunning(false)
          return
        }
      }

      setPipelineDone(true)
      setIsRunning(false)
      setShouldRefreshOnClose(true)
    })().finally(() => {
      if (!isStale()) startedPipelineLocks.delete(lockKey)
    })

    return () => {
      runIdRef.current += 1
      startedPipelineLocks.delete(lockKey)
    }
  }, [open, guestAppointmentId, sessionKey, patchStep, execStep])

  const hasError = steps.some((s) => s.status === 'error')
  const meetingLinkReady = pipelineDone && Boolean(meetUrl?.trim())
  /** Close only when link + copy are shown, or after a failed run (escape hatch). */
  const canDismiss = meetingLinkReady || (hasError && !isRunning)

  const blockDismiss = (e: Event) => {
    if (!canDismiss) e.preventDefault()
  }

  const handleCopy = async () => {
    if (!meetUrl) return
    try {
      await navigator.clipboard.writeText(meetUrl)
      toast.success('Meeting link copied')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && !canDismiss) return
    if (!next && shouldRefreshOnClose) {
      onCompleteRef.current?.()
      setShouldRefreshOnClose(false)
    }
    onOpenChange(next)
  }

  const handleDone = () => {
    if (!canDismiss) return
    if (shouldRefreshOnClose) {
      onCompleteRef.current?.()
      setShouldRefreshOnClose(false)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md rounded-2xl"
        showCloseButton={canDismiss}
        onPointerDownOutside={blockDismiss}
        onInteractOutside={blockDismiss}
        onFocusOutside={blockDismiss}
        onEscapeKeyDown={blockDismiss}
      >
        <DialogHeader>
          <DialogTitle className="font-heading">Create meeting</DialogTitle>
          <DialogDescription>
            {patientLabel}
            {providerLabel ? ` · ${providerLabel}` : ''}
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-3 max-h-[min(50vh,320px)] overflow-y-auto pr-1" aria-live="polite">
          {steps.map((step) => (
            <li
              key={step.id}
              className={cn(
                'flex gap-3 rounded-xl border p-3 text-sm transition-colors',
                step.status === 'running' && 'border-primary/30 bg-primary/5',
                step.status === 'done' && 'border-emerald-500/20 bg-emerald-500/5',
                step.status === 'error' && 'border-red-500/30 bg-red-500/5',
                step.status === 'pending' && 'border-border/60 bg-muted/30',
                step.status === 'skipped' && 'border-border/40 opacity-70',
              )}
            >
              <StepIcon status={step.status} />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium leading-snug">{step.label}</p>
                  {step.durationMs != null && step.status !== 'pending' && (
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatDuration(step.durationMs)}
                    </span>
                  )}
                </div>
                {step.detail ? (
                  <p className="text-xs text-muted-foreground break-words">{step.detail}</p>
                ) : null}
                {step.error ? (
                  <p className="text-xs text-red-600 dark:text-red-400">{step.error}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        {pipelineDone && meetUrl ? (
          <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium">Meeting link</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={meetUrl}
                className="rounded-xl text-xs font-mono h-10 bg-background"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 rounded-xl h-10 w-10"
                onClick={handleCopy}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          {isRunning ? (
            <p className="text-xs text-muted-foreground mr-auto flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Running…
            </p>
          ) : null}
          {canDismiss ? (
            <Button
              type="button"
              variant={meetingLinkReady ? 'default' : 'outline'}
              className="rounded-xl"
              onClick={handleDone}
            >
              {meetingLinkReady ? 'Done' : 'Close'}
            </Button>
          ) : (
            <Button type="button" variant="outline" className="rounded-xl" disabled>
              {isRunning ? 'Please wait…' : 'Processing…'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
