'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { NewsletterDialog } from './NewsletterDialog'
import { DeleteDialog } from '../_components/DeleteDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { deleteNewsletterSubscriber } from '@/features/admin/actions'
import { toast } from 'sonner'
import { NewsletterSendDialog } from './NewsletterSendDialog'

interface NewsletterSubscriber {
  id: number
  email: string
  subscribed_at: string
  status: string
}

interface NewsletterTableProps {
  initialData: NewsletterSubscriber[]
  initialPage: number
  totalPages: number
  count: number
  activeRecipientCount: number
}

export function NewsletterTable({
  initialData,
  initialPage,
  totalPages,
  count,
  activeRecipientCount,
}: NewsletterTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSendOpen, setIsSendOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/application/enter/newsletter?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/newsletter?${params.toString()}`)
  }

  const handleAdd = () => {
    setSelectedSubscriber(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (subscriber: NewsletterSubscriber) => {
    setSelectedSubscriber(subscriber)
    setIsDialogOpen(true)
  }

  const handleDelete = (subscriber: NewsletterSubscriber) => {
    setSelectedSubscriber(subscriber)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedSubscriber) return

    startTransition(async () => {
      try {
        const result = await deleteNewsletterSubscriber(selectedSubscriber.id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('Subscriber deleted successfully')
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete subscriber')
      }
    })
  }

  const columns = [
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'status',
      label: 'Status',
      render: (subscriber: NewsletterSubscriber) => {
        const s = subscriber.status
        const label =
          s === 'resubscribed'
            ? 'Resubscribed'
            : s.replace(/_/g, ' ')
        const variant =
          s === 'active'
            ? 'default'
            : s === 'resubscribed'
              ? 'secondary'
              : 'outline'
        return (
          <Badge variant={variant} className="capitalize">
            {label}
          </Badge>
        )
      },
    },
    {
      key: 'subscribed_at',
      label: 'Subscribed',
      render: (subscriber: NewsletterSubscriber) => format(new Date(subscriber.subscribed_at), 'MMM dd, yyyy'),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search subscribers..."
        onSearch={handleSearch}
        headerExtra={
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-teal-300 dark:border-teal-700 gap-2"
            onClick={() => setIsSendOpen(true)}
          >
            Send newsletter
          </Button>
        }
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Add Subscriber"
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <NewsletterSendDialog
        open={isSendOpen}
        onOpenChange={setIsSendOpen}
        activeRecipientCount={activeRecipientCount}
        onQueued={() => router.refresh()}
      />
      <NewsletterDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        subscriber={selectedSubscriber}
        onSuccess={() => {
          setIsDialogOpen(false)
          router.refresh()
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Subscriber"
        description={`Are you sure you want to delete ${selectedSubscriber?.email}? This action cannot be undone.`}
        isPending={isPending}
      />
    </>
  )
}
