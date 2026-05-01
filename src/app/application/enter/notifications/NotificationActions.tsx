'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { markAdminNotificationRead, markAllAdminNotificationsRead } from '@/features/admin/actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function MarkAllReadButton() {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-xl"
      disabled={pending}
      onClick={() => {
        start(async () => {
          const r = await markAllAdminNotificationsRead()
          if (r.success) {
            toast.success('All notifications marked as read')
            router.refresh()
          } else {
            toast.error(r.error)
          }
        })
      }}
    >
      Mark all read
    </Button>
  )
}

export function MarkReadButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="rounded-xl shrink-0"
      disabled={disabled || pending}
      onClick={() => {
        start(async () => {
          const r = await markAdminNotificationRead({ id })
          if (r.success) {
            router.refresh()
          } else {
            toast.error(r.error)
          }
        })
      }}
    >
      Mark read
    </Button>
  )
}
