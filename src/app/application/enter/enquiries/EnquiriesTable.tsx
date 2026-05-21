'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { DeleteDialog } from '../_components/DeleteDialog'
import { EnquiryViewDialog } from './EnquiryViewDialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { deleteContactMessage, type ContactMessageRow } from '@/features/admin/actions'
import { toast } from 'sonner'
import { Eye, Trash2 } from 'lucide-react'

interface EnquiriesTableProps {
  initialData: ContactMessageRow[]
  initialPage: number
  totalPages: number
  count: number
}

export function EnquiriesTable({ initialData, initialPage, totalPages, count }: EnquiriesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<ContactMessageRow | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/application/enter/enquiries?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/enquiries?${params.toString()}`)
  }

  const openView = (row: ContactMessageRow) => {
    setSelected(row)
    setViewOpen(true)
  }

  const openDelete = (row: ContactMessageRow) => {
    setSelected(row)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!selected) return
    startTransition(async () => {
      const result = await deleteContactMessage({ id: selected.id })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Enquiry deleted')
      setDeleteOpen(false)
      setSelected(null)
      router.refresh()
    })
  }

  const columns = [
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (row: ContactMessageRow) => (
        <span className="line-clamp-2 max-w-[220px]">{row.subject}</span>
      ),
    },
    {
      key: 'message',
      label: 'Preview',
      render: (row: ContactMessageRow) => (
        <span className="line-clamp-2 max-w-[260px] text-lp-on-surface-variant">{row.message}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Received',
      render: (row: ContactMessageRow) => format(new Date(row.created_at), 'MMM dd, yyyy HH:mm'),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search by email..."
        onSearch={handleSearch}
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
        renderRowActions={(row) => (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => openView(row)}
              className="rounded-lg hover:bg-lp-surface-container/80 dark:hover:bg-white/5"
              aria-label="View enquiry"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => openDelete(row)}
              className="rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              aria-label="Delete enquiry"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      />
      <EnquiryViewDialog open={viewOpen} onOpenChange={setViewOpen} enquiry={selected} />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete enquiry"
        description={
          selected
            ? `Remove this message from ${selected.email}? This cannot be undone.`
            : 'This cannot be undone.'
        }
        isPending={isPending}
      />
    </>
  )
}
