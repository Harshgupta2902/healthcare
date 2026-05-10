'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Code2, Eye } from 'lucide-react'
import type { NewsletterCampaignRow } from '@/features/admin/actions'
import { cn } from '@/lib/utils'

interface CampaignViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: NewsletterCampaignRow | null
}

type Tab = 'preview' | 'html'

export function CampaignViewDialog({ open, onOpenChange, campaign }: CampaignViewDialogProps) {
  const [tab, setTab] = useState<Tab>('preview')

  if (!campaign) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col rounded-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-left pr-8 text-xl">{campaign.subject}</DialogTitle>
          <DialogDescription className="text-left">
            Sent {format(new Date(campaign.created_at), 'MMM d, yyyy · h:mm a')}
            <span className="text-muted-foreground"> · </span>
            {campaign.recipient_ids?.length ?? 0} subscribers
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 px-6 py-3 border-b border-border shrink-0">
          <Button
            type="button"
            size="sm"
            variant={tab === 'preview' ? 'default' : 'outline'}
            onClick={() => setTab('preview')}
            className={cn(
              'rounded-xl gap-2',
              tab === 'preview' && 'bg-gradient-to-r from-teal-500 to-cyan-500'
            )}
          >
            <Eye className="h-4 w-4" />
            Rendered preview
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === 'html' ? 'default' : 'outline'}
            onClick={() => setTab('html')}
            className={cn(
              'rounded-xl gap-2',
              tab === 'html' && 'bg-gradient-to-r from-teal-500 to-cyan-500'
            )}
          >
            <Code2 className="h-4 w-4" />
            Raw HTML
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto bg-muted/30">
          {tab === 'preview' ? (
            <div className="p-4">
              <div className="rounded-xl border border-teal-200/50 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-inner p-6">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground"
                  dangerouslySetInnerHTML={{ __html: campaign.body_html }}
                />
              </div>
            </div>
          ) : (
            <pre className="text-xs font-mono leading-relaxed p-4 whitespace-pre-wrap break-all text-foreground">
              {campaign.body_html}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
