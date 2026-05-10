'use client'

import { useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
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
import { Label } from '@/components/ui/label'
import { sendNewsletterBroadcast } from '@/features/admin/actions'
import { toast } from 'sonner'
import { Eye, Loader2, Mail, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

const LexicalPrescriptionEditor = dynamic(
  () =>
    import('@/app/dashboard/_components/LexicalPrescriptionEditor').then(
      (m) => m.LexicalPrescriptionEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[320px] rounded-xl border border-teal-200/50 bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    ),
  }
)

interface NewsletterSendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeRecipientCount: number
  onQueued?: () => void
}

export function NewsletterSendDialog({
  open,
  onOpenChange,
  activeRecipientCount,
  onQueued,
}: NewsletterSendDialogProps) {
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [editorKey, setEditorKey] = useState(0)
  const [isPending, startTransition] = useTransition()

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubject('')
      setHtmlBody('')
      setEditorKey((k) => k + 1)
    }
    onOpenChange(next)
  }

  const handleSend = () => {
    startTransition(async () => {
      const result = await sendNewsletterBroadcast({ subject: subject.trim(), htmlBody })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        `Newsletter queued for ${result.queued} recipient${result.queued === 1 ? '' : 's'}. Emails send in the background.`
      )
      handleOpenChange(false)
      onQueued?.()
    })
  }

  const canSend =
    activeRecipientCount > 0 && subject.trim().length > 0 && htmlBody.replace(/<[^>]+>/g, '').trim().length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl max-w-[95vw] w-full lg:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5 text-teal-600" />
            Send newsletter
          </DialogTitle>
          <DialogDescription className="text-left">
            Compose your message below. It will be emailed to{' '}
            <span className="font-semibold text-foreground">{activeRecipientCount}</span> active subscriber
            {activeRecipientCount === 1 ? '' : 's'} (status: active or resubscribed). Each email includes an
            unsubscribe link automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-2">
            <Label htmlFor="newsletter-subject">Subject line</Label>
            <Input
              id="newsletter-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. March health tips from HealthHere"
              className="rounded-xl"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-base font-semibold">Message body</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => setShowPreview((v) => !v)}
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Hide preview' : 'Show preview'}
            </Button>
          </div>

          <div
            className={cn(
              'grid gap-4 min-h-[min(420px,50vh)]',
              showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'
            )}
          >
            <div className="flex flex-col min-h-[320px]">
              <p className="text-xs text-muted-foreground mb-2">Editor</p>
              <LexicalPrescriptionEditor
                key={editorKey}
                initialHtml=""
                onHtmlChange={setHtmlBody}
                compact
                className="flex-1 border-teal-200/60 dark:border-gray-700 min-h-[280px]"
              />
            </div>
            {showPreview && (
              <div className="flex flex-col min-h-[320px]">
                <p className="text-xs text-muted-foreground mb-2">Preview (how readers see it)</p>
                <div className="rounded-xl border border-teal-200/50 dark:border-gray-700 bg-white dark:bg-gray-950 overflow-auto flex-1 p-4 shadow-inner">
                  {htmlBody.trim() ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground"
                      dangerouslySetInnerHTML={{ __html: htmlBody }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground italic py-8 text-center">
                      Start typing in the editor — preview appears here.
                    </p>
                  )}
                  <p className="mt-6 pt-4 border-t text-xs text-muted-foreground">
                    Unsubscribe footer is added automatically to each sent email.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border shrink-0 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="rounded-xl"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend || isPending}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Queue send ({activeRecipientCount})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
