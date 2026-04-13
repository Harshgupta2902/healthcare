'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { MedicationDialog } from './MedicationDialog'
import { DeleteDialog } from '../_components/DeleteDialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { deleteMedication } from '@/features/admin/actions'
import { toast } from 'sonner'

interface Medication {
  id: string
  user_id: string
  medication_name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  prescribing_doctor: string | null
  notes: string | null
  is_active: boolean
  user?: { name: string | null; email: string }
}

interface MedicationsTableProps {
  initialData: Medication[]
  initialPage: number
  totalPages: number
  count: number
}

export function MedicationsTable({ initialData, initialPage, totalPages, count }: MedicationsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/application/enter/medications?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/medications?${params.toString()}`)
  }

  const handleAdd = () => {
    setSelectedMedication(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (medication: Medication) => {
    setSelectedMedication(medication)
    setIsDialogOpen(true)
  }

  const handleDelete = (medication: Medication) => {
    setSelectedMedication(medication)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMedication) return

    startTransition(async () => {
      try {
        const result = await deleteMedication(selectedMedication.id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('Medication deleted successfully')
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete medication')
      }
    })
  }

  const columns = [
    {
      key: 'user',
      label: 'Patient',
      render: (medication: Medication) => medication.user?.name || 'N/A',
    },
    {
      key: 'medication_name',
      label: 'Medication',
    },
    {
      key: 'dosage',
      label: 'Dosage',
    },
    {
      key: 'frequency',
      label: 'Frequency',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (medication: Medication) => (
        <Badge variant={medication.is_active ? 'default' : 'secondary'}>
          {medication.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (medication: Medication) => format(new Date(medication.start_date), 'MMM dd, yyyy'),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search medications..."
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Add Medication"
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <MedicationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        medication={selectedMedication}
        onSuccess={() => {
          setIsDialogOpen(false)
          router.refresh()
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Medication"
        description="Are you sure you want to delete this medication? This action cannot be undone."
        isPending={isPending}
      />
    </>
  )
}
