'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { setQualificationDocumentApproval } from '@/features/admin/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export type QualificationReviewRow = {
  id: string
  degree: string
  institution: string
  year: number | null
  document_url: string
  document_approved: boolean | null
  professional?: { name: string | null; email: string | null } | null
}

function previewKind(url: string): 'pdf' | 'image' | 'other' {
  const path = url.split('?')[0].toLowerCase()
  if (path.endsWith('.pdf')) return 'pdf'
  if (/\.(webp|jpe?g|png|gif)$/i.test(path)) return 'image'
  return 'other'
}

interface QualificationReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: QualificationReviewRow | null
  onUpdated: () => void
}

export function QualificationReviewDialog({
  open,
  onOpenChange,
  row,
  onUpdated,
}: QualificationReviewDialogProps) {
  const [isPending, startTransition] = useTransition()

  const prof = row?.professional
  const professionalName =
    prof && !Array.isArray(prof) ? prof.name || prof.email || 'Professional' : 'Professional'

  const handleDecision = (documentApproved: boolean) => {
    if (!row) return
    startTransition(async () => {
      const result = await setQualificationDocumentApproval({
        id: row.id,
        documentApproved,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(documentApproved ? 'Credential approved.' : 'Credential declined.')
      onOpenChange(false)
      onUpdated()
    })
  }

  const kind = row ? previewKind(row.document_url) : 'other'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Review qualification document</DialogTitle>
          <DialogDescription>
            {row ? (
              <>
                <span className="font-semibold text-foreground">{professionalName}</span>
                {' — '}
                {row.degree} · {row.institution}
                {row.year != null ? ` · ${row.year}` : ''}
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {row && (
          <div className="flex-1 min-h-[320px] rounded-xl border border-teal-200/50 dark:border-gray-700 overflow-hidden bg-slate-50 dark:bg-gray-900/50">
            {kind === 'pdf' && (
              <iframe
                title="Qualification document"
                src={row.document_url}
                className="w-full h-[min(60vh,520px)] bg-white"
              />
            )}
            {kind === 'image' && (
              <img
                src={row.document_url}
                alt="Qualification document"
                className="max-h-[min(60vh,520px)] w-auto mx-auto block object-contain"
              />
            )}
            {kind === 'other' && (
              <div className="flex flex-col items-center justify-center h-[min(60vh,320px)] gap-4 p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Preview is not available for this file type. Open in a new tab to review.
                </p>
                <Button variant="outline" className="rounded-xl" asChild>
                  <a href={row.document_url} target="_blank" rel="noopener noreferrer">
                    Open file
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={isPending || !row}
            onClick={() => handleDecision(false)}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Decline
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            disabled={isPending || !row}
            onClick={() => handleDecision(true)}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
