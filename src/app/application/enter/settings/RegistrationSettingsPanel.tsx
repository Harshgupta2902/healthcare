'use client'

import { useEffect, type ComponentProps } from 'react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { MailCheck, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateRegistrationSettings } from '@/features/admin/actions'
import {
  REGISTRATION_OTP_EXPIRY_MINUTES,
  REGISTRATION_OTP_LENGTH,
} from '@/lib/registration-constants'
import { registrationSettingsSchema, type RegistrationSettings } from '@/lib/registration-settings'
import { cn } from '@/lib/utils'
import { adminTheme } from '../_components/admin-theme'

const limitsFormSchema = registrationSettingsSchema.pick({
  otp_max_attempts: true,
  resend_cooldown_seconds: true,
})

type LimitsFormValues = z.infer<typeof limitsFormSchema>

type RegistrationSettingsPanelProps = {
  settings: RegistrationSettings
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

function NumberField({
  id,
  label,
  description,
  error,
  disabled,
  ...inputProps
}: {
  id: string
  label: string
  description?: string
  error?: string
  disabled?: boolean
} & ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-sans text-sm font-medium text-lp-on-surface">
        {label}
      </Label>
      {description ? (
        <p className="font-sans text-xs text-lp-on-surface-variant">{description}</p>
      ) : null}
      <Input
        id={id}
        type="number"
        disabled={disabled}
        className={cn(adminTheme.input, 'h-10')}
        {...inputProps}
      />
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  )
}

export function RegistrationSettingsPanel({ settings, updatedAt }: RegistrationSettingsPanelProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<LimitsFormValues>({
    resolver: zodResolver(limitsFormSchema),
    defaultValues: {
      otp_max_attempts: settings.otp_max_attempts,
      resend_cooldown_seconds: settings.resend_cooldown_seconds,
    },
  })

  useEffect(() => {
    form.reset({
      otp_max_attempts: settings.otp_max_attempts,
      resend_cooldown_seconds: settings.resend_cooldown_seconds,
    })
  }, [form, settings])

  const lastUpdated = formatUpdatedAt(updatedAt)

  const handleOtpToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await updateRegistrationSettings({ email_otp_enabled: checked })
      if (result.success) {
        toast.success(
          checked
            ? 'Email OTP verification enabled for registration.'
            : 'Email OTP verification disabled for registration.',
        )
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const onSaveLimits = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateRegistrationSettings(values)
      if (result.success) {
        toast.success('Registration OTP settings saved.')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  })

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="liquid-glass rounded-2xl border border-white/50 p-6 shadow-lg dark:border-white/10"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lp-brand/15 to-lp-brand-bright/15 text-lp-brand">
          <MailCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-lp-on-surface">Registration</h2>
          <p className="mt-1 font-sans text-sm text-lp-on-surface-variant">
            Email OTP verification for the public sign-up page.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div
          className={cn(
            'flex flex-col gap-4 rounded-xl border border-lp-outline-variant/30 bg-white/35 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-lp-primary-container/30',
            pending && 'opacity-70',
          )}
        >
          <div className="min-w-0 flex-1 space-y-1">
            <Label htmlFor="email-otp-toggle" className="font-sans text-base font-medium text-lp-on-surface">
              Email OTP verification
            </Label>
            <p className="font-sans text-sm text-lp-on-surface-variant">
              When enabled, users must verify their email with a one-time code before their account is
              created.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 font-sans text-xs font-semibold',
                settings.email_otp_enabled
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-lp-surface-container text-lp-on-surface-variant',
              )}
            >
              {settings.email_otp_enabled ? 'On' : 'Off'}
            </span>
            <Switch
              id="email-otp-toggle"
              checked={settings.email_otp_enabled}
              disabled={pending}
              onCheckedChange={handleOtpToggle}
              aria-label="Toggle email OTP verification on registration"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-lp-outline-variant/25 bg-lp-surface-container-lowest/50 px-4 py-3 dark:bg-white/5">
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-lp-on-surface-variant">
              OTP length (fixed)
            </p>
            <p className="mt-1 font-heading text-lg font-semibold text-lp-on-surface">
              {REGISTRATION_OTP_LENGTH} characters
            </p>
          </div>
          <div className="rounded-xl border border-lp-outline-variant/25 bg-lp-surface-container-lowest/50 px-4 py-3 dark:bg-white/5">
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-lp-on-surface-variant">
              OTP validity (fixed)
            </p>
            <p className="mt-1 font-heading text-lg font-semibold text-lp-on-surface">
              {REGISTRATION_OTP_EXPIRY_MINUTES} minutes
            </p>
          </div>
        </div>

        <form
          onSubmit={onSaveLimits}
          className="space-y-5 rounded-xl border border-lp-outline-variant/30 bg-white/35 p-4 dark:bg-lp-primary-container/30"
        >
          <div>
            <h3 className="font-heading text-base font-semibold text-lp-on-surface">Configurable limits</h3>
            <p className="mt-1 font-sans text-sm text-lp-on-surface-variant">
              Saved to the backend and applied on the register page immediately.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="otp_max_attempts"
              label="Max wrong attempts"
              description="Wrong code tries before a new OTP is required (3–10)"
              min={3}
              max={10}
              disabled={pending}
              error={form.formState.errors.otp_max_attempts?.message}
              {...form.register('otp_max_attempts', { valueAsNumber: true })}
            />
            <NumberField
              id="resend_cooldown_seconds"
              label="Resend cooldown (seconds)"
              description="Wait time on the Resend code button (15–300)"
              min={15}
              max={300}
              disabled={pending}
              error={form.formState.errors.resend_cooldown_seconds?.message}
              {...form.register('resend_cooldown_seconds', { valueAsNumber: true })}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending} className={cn('gap-2 rounded-xl', adminTheme.ctaButton)}>
              <Save className="h-4 w-4" />
              Save settings
            </Button>
          </div>
        </form>

        {lastUpdated ? (
          <p className={cn('font-sans text-xs', adminTheme.iconMuted)}>Last updated {lastUpdated}</p>
        ) : null}
      </div>
    </motion.section>
  )
}
