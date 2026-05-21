'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import type { ContactMessageRow } from '@/features/admin/actions'

interface EnquiryViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enquiry: ContactMessageRow | null
}

export function EnquiryViewDialog({ open, onOpenChange, enquiry }: EnquiryViewDialogProps) {
  if (!enquiry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-left pr-8">{enquiry.subject}</DialogTitle>
          <p className="text-left text-sm text-lp-on-surface-variant">
            {enquiry.email}
            <span className="text-gray-400 dark:text-gray-500"> · </span>
            {format(new Date(enquiry.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </DialogHeader>
        <div className="mt-4 rounded-xl border border-lp-outline-variant/40 dark:border-white/10/50 liquid-glass rounded-xl p-4">
          <p className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">{enquiry.message}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
