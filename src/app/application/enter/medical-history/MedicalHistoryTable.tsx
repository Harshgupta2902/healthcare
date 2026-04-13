'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { MedicalHistoryDialog } from './MedicalHistoryDialog'
import { DeleteDialog } from '../_components/DeleteDialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { deleteMedicalHistory } from '@/features/admin/actions'
import { toast } from 'sonner'

interface MedicalHistory {
  id: string
  user_id: string
  condition_name: string
  diagnosis_date: string | null
  status: string
  notes: string | null
  created_at: string
  user?: { name: string | null; email: string }
}

interface MedicalHistoryTableProps {
  initialData: MedicalHistory[]
  initialPage: number
  totalPages: number
  count: number
}

export function MedicalHistoryTable({ initialData, initialPage, totalPages, count }: MedicalHistoryTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalHistory | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/application/enter/medical-history?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/medical-history?${params.toString()}`)
  }

  const handleAdd = () => {
    setSelectedRecord(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (record: MedicalHistory) => {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  const handleDelete = (record: MedicalHistory) => {
    setSelectedRecord(record)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return

    startTransition(async () => {
      try {
        const result = await deleteMedicalHistory(selectedRecord.id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('Medical history record deleted successfully')
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete record')
      }
    })
  }

  const columns = [
    {
      key: 'user',
      label: 'Patient',
      render: (record: MedicalHistory) => record.user?.name || 'N/A',
    },
    {
      key: 'condition_name',
      label: 'Condition',
    },
    {
      key: 'diagnosis_date',
      label: 'Diagnosis Date',
      render: (record: MedicalHistory) =>
        record.diagnosis_date ? format(new Date(record.diagnosis_date), 'MMM dd, yyyy') : 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      render: (record: MedicalHistory) => (
        <Badge variant={record.status === 'active' ? 'default' : 'secondary'} className="capitalize">
          {record.status}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (record: MedicalHistory) => format(new Date(record.created_at), 'MMM dd, yyyy'),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search medical history..."
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Add Medical History"
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <MedicalHistoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        record={selectedRecord}
        onSuccess={() => {
          setIsDialogOpen(false)
          router.refresh()
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Medical History"
        description="Are you sure you want to delete this medical history record? This action cannot be undone."
        isPending={isPending}
      />
    </>
  )
}
