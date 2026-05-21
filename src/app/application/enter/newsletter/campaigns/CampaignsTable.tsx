'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { DataTable } from '../../_components/DataTable'
import { DeleteDialog } from '../../_components/DeleteDialog'
import { CampaignViewDialog } from './CampaignViewDialog'
import { CampaignRecipientsDialog } from './CampaignRecipientsDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Users, Trash2 } from 'lucide-react'
import { deleteNewsletterCampaign, type NewsletterCampaignRow } from '@/features/admin/actions'
import { toast } from 'sonner'

interface CampaignsTableProps {
  initialData: NewsletterCampaignRow[]
  initialPage: number
  totalPages: number
  count: number
}

export function CampaignsTable({ initialData, initialPage, totalPages, count }: CampaignsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [viewOpen, setViewOpen] = useState(false)
  const [recipientsOpen, setRecipientsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<NewsletterCampaignRow | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) params.set('search', query)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/application/enter/newsletter/campaigns?${params.toString()}`)
  }

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', p.toString())
    router.push(`/application/enter/newsletter/campaigns?${params.toString()}`)
  }

  const openView = (row: NewsletterCampaignRow) => {
    setSelected(row)
    setViewOpen(true)
  }
  const openRecipients = (row: NewsletterCampaignRow) => {
    setSelected(row)
    setRecipientsOpen(true)
  }
  const openDelete = (row: NewsletterCampaignRow) => {
    setSelected(row)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!selected) return
    startTransition(async () => {
      const result = await deleteNewsletterCampaign(selected.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Campaign deleted')
      setDeleteOpen(false)
      router.refresh()
    })
  }

  const columns = [
    {
      key: 'subject',
      label: 'Subject',
      render: (row: NewsletterCampaignRow) => (
        <span className="font-medium text-foreground">{row.subject}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Sent at',
      render: (row: NewsletterCampaignRow) =>
        format(new Date(row.created_at), 'MMM d, yyyy · h:mm a'),
    },
    {
      key: 'recipients',
      label: 'Recipients',
      render: (row: NewsletterCampaignRow) => {
        const total = row.recipient_ids?.length ?? 0
        return (
          <Badge variant="default" className="rounded-md">
            {total} {total === 1 ? 'subscriber' : 'subscribers'}
          </Badge>
        )
      },
    },
  ]

  return (
    <>
      <DataTable<NewsletterCampaignRow>
        data={initialData}
        columns={columns}
        searchPlaceholder="Search by subject..."
        onSearch={handleSearch}
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
        renderRowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openView(row)}
              className="rounded-lg hover:bg-lp-surface-container/80 dark:hover:bg-white/5"
              aria-label="View HTML"
              title="View HTML"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openRecipients(row)}
              className="rounded-lg hover:bg-lp-surface-container/80 dark:hover:bg-white/5"
              aria-label="View recipients"
              title="View recipients"
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDelete(row)}
              className="rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
              aria-label="Delete campaign"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      />

      <CampaignViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        campaign={selected}
      />
      <CampaignRecipientsDialog
        open={recipientsOpen}
        onOpenChange={setRecipientsOpen}
        campaign={selected}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete campaign"
        description={`Delete "${selected?.subject ?? ''}"? Recipient delivery rows will be removed too. This cannot be undone.`}
        isPending={isPending}
      />
    </>
  )
}
