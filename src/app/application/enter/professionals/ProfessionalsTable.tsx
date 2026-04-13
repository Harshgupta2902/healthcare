'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { ProfessionalDialog } from './ProfessionalDialog'
import { DeleteDialog } from '../_components/DeleteDialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { deleteProfessional } from '@/features/admin/actions'
import { toast } from 'sonner'

interface Professional {
  id: string
  user_id: string
  specialization: string
  license_number: string
  bio: string | null
  years_of_experience: number | null
  consultation_fee: number | null
  is_verified: boolean
  city: string | null
  created_at: string
  users?: {
    name: string | null
    email: string
  }
}

interface ProfessionalsTableProps {
  initialData: Professional[]
  initialPage: number
  totalPages: number
  count: number
}

export function ProfessionalsTable({ initialData, initialPage, totalPages, count }: ProfessionalsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/application/enter/professionals?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/professionals?${params.toString()}`)
  }

  const handleAdd = () => {
    setSelectedProfessional(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (professional: Professional) => {
    setSelectedProfessional(professional)
    setIsDialogOpen(true)
  }

  const handleDelete = (professional: Professional) => {
    setSelectedProfessional(professional)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProfessional) return

    startTransition(async () => {
      try {
        const result = await deleteProfessional(selectedProfessional.id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('Professional deleted successfully')
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete professional')
      }
    })
  }

  const columns = [
    {
      key: 'users',
      label: 'Name',
      render: (professional: Professional) => professional.users?.name || 'N/A',
    },
    {
      key: 'specialization',
      label: 'Specialization',
    },
    {
      key: 'license_number',
      label: 'License',
    },
    {
      key: 'is_verified',
      label: 'Status',
      render: (professional: Professional) => (
        <Badge variant={professional.is_verified ? 'default' : 'secondary'}>
          {professional.is_verified ? 'Verified' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'consultation_fee',
      label: 'Fee (₹)',
      render: (professional: Professional) =>
        professional.consultation_fee ? `${(professional.consultation_fee / 100).toFixed(2)}` : 'N/A',
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (professional: Professional) => format(new Date(professional.created_at), 'MMM dd, yyyy'),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search professionals..."
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Add Professional"
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <ProfessionalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        professional={selectedProfessional}
        onSuccess={() => {
          setIsDialogOpen(false)
          router.refresh()
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Professional"
        description={`Are you sure you want to delete this professional? This action cannot be undone.`}
        isPending={isPending}
      />
    </>
  )
}
