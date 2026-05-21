'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getCampaignRecipientEmails,
  type CampaignRecipientEmail,
  type NewsletterCampaignRow,
} from '@/features/admin/actions'

interface CampaignRecipientsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: NewsletterCampaignRow | null
}

export function CampaignRecipientsDialog({ open, onOpenChange, campaign }: CampaignRecipientsDialogProps) {
  const [recipients, setRecipients] = useState<CampaignRecipientEmail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open || !campaign) return
    setLoading(true)
    setError(null)
    setCopied(false)
    getCampaignRecipientEmails(campaign.id)
      .then((res) => {
        if (res.success) setRecipients(res.data)
        else setError(res.error)
      })
      .finally(() => setLoading(false))
  }, [open, campaign])

  const csv = useMemo(() => recipients.map((r) => r.email).join(', '), [recipients])

  const expectedTotal = campaign?.recipient_ids?.length ?? 0
  const resolvedTotal = recipients.length
  const missingCount = Math.max(0, expectedTotal - resolvedTotal)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(csv)
      setCopied(true)
      toast.success('Emails copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy emails')
    }
  }

  if (!campaign) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col rounded-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-left pr-8 text-xl">Recipients</DialogTitle>
          <DialogDescription className="text-left">
            <span className="font-medium text-foreground">{campaign.subject}</span>
            <span className="text-muted-foreground"> · </span>
            Sent to {expectedTotal} {expectedTotal === 1 ? 'subscriber' : 'subscribers'}
            {missingCount > 0 && (
              <>
                <span className="text-muted-foreground"> · </span>
                <span className="text-amber-600 dark:text-amber-400">
                  {missingCount} subscriber{missingCount === 1 ? '' : 's'} no longer exist
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 px-6 py-3 border-b border-border shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!csv}
            className="rounded-xl gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy emails
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading recipients…
            </div>
          ) : error ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : recipients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No recipients to show.</p>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Comma-separated list ({recipients.length})
                </p>
                <div className="rounded-xl border border-lp-outline-variant/40 dark:border-white/10 bg-white dark:bg-gray-950 p-4 max-h-48 overflow-auto text-sm leading-relaxed break-words">
                  {csv}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Subscribers ({recipients.length})
                </p>
                <ul className="space-y-1.5">
                  {recipients.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 text-sm rounded-lg border border-border bg-card px-3 py-2"
                    >
                      <span className="break-all">{r.email}</span>
                      <SubscriberStatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SubscriberStatusBadge({ status }: { status: string }) {
  if (status === 'unsubscribed') {
    return (
      <Badge variant="outline" className="rounded-md">
        Unsubscribed since
      </Badge>
    )
  }
  if (status === 'resubscribed') {
    return (
      <Badge variant="secondary" className="rounded-md">
        Resubscribed
      </Badge>
    )
  }
  return (
    <Badge variant="default" className="rounded-md">
      Active
    </Badge>
  )
}
