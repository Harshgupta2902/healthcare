'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { DocumentDialog } from './DocumentDialog'
import { DeleteDialog } from '../_components/DeleteDialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { deleteDocument } from '@/features/admin/actions'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'

export interface Document {
  id: string
  user_id: string
  document_name: string
  document_type: string
  file_url: string
  file_size: number | null
  notes: string | null
  upload_date: string
  user?: { name: string | null; email: string }
}

interface DocumentsTableProps {
  initialData: Document[]
  initialPage: number
  totalPages: number
  count: number
}

export function DocumentsTable({ initialData, initialPage, totalPages, count }: DocumentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/application/enter/documents?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/documents?${params.toString()}`)
  }

  const handleAdd = () => {
    setSelectedDocument(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (document: Document) => {
    setSelectedDocument(document)
    setIsDialogOpen(true)
  }

  const handleDelete = (document: Document) => {
    setSelectedDocument(document)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return

    startTransition(async () => {
      try {
        const result = await deleteDocument(selectedDocument.id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('Document deleted successfully')
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete document')
      }
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const columns = [
    {
      key: 'user',
      label: 'Patient',
      render: (document: Document) => document.user?.name || 'N/A',
    },
    {
      key: 'document_name',
      label: 'Document Name',
    },
    {
      key: 'document_type',
      label: 'Type',
      render: (document: Document) => (
        <Badge variant="outline" className="capitalize">
          {document.document_type}
        </Badge>
      ),
    },
    {
      key: 'file_size',
      label: 'Size',
      render: (document: Document) => formatFileSize(document.file_size),
    },
    {
      key: 'file_url',
      label: 'File',
      render: (document: Document) => (
        <a
          href={document.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-teal-600 hover:text-teal-700"
        >
          View <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    {
      key: 'upload_date',
      label: 'Uploaded',
      render: (document: Document) => format(new Date(document.upload_date), 'MMM dd, yyyy'),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search documents..."
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Add Document"
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <DocumentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        document={selectedDocument}
        onSuccess={() => {
          setIsDialogOpen(false)
          router.refresh()
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        isPending={isPending}
      />
    </>
  )
}
