'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { InsuranceDialog } from './InsuranceDialog'
import { DeleteDialog } from '../_components/DeleteDialog'
import { format } from 'date-fns'
import { deleteInsurance } from '@/features/admin/actions'
import { toast } from 'sonner'

interface Insurance {
  id: string
  user_id: string
  provider_name: string
  policy_number: string
  group_number: string | null
  policy_holder_name: string
  relationship_to_holder: string | null
  expiration_date: string | null
  notes: string | null
  created_at: string
  user?: { name: string | null; email: string }
}

interface InsuranceTableProps {
  initialData: Insurance[]
  initialPage: number
  totalPages: number
  count: number
}

export function InsuranceTable({ initialData, initialPage, totalPages, count }: InsuranceTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/application/enter/insurance?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/insurance?${params.toString()}`)
  }

  const handleAdd = () => {
    setSelectedInsurance(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (insurance: Insurance) => {
    setSelectedInsurance(insurance)
    setIsDialogOpen(true)
  }

  const handleDelete = (insurance: Insurance) => {
    setSelectedInsurance(insurance)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedInsurance) return

    startTransition(async () => {
      try {
        await deleteInsurance(selectedInsurance.id)
        toast.success('Insurance record deleted successfully')
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete insurance')
      }
    })
  }

  const columns = [
    {
      key: 'user',
      label: 'Patient',
      render: (insurance: Insurance) => insurance.user?.name || 'N/A',
    },
    {
      key: 'provider_name',
      label: 'Provider',
    },
    {
      key: 'policy_number',
      label: 'Policy Number',
    },
    {
      key: 'policy_holder_name',
      label: 'Policy Holder',
    },
    {
      key: 'expiration_date',
      label: 'Expiration',
      render: (insurance: Insurance) =>
        insurance.expiration_date ? format(new Date(insurance.expiration_date), 'MMM dd, yyyy') : 'N/A',
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (insurance: Insurance) => format(new Date(insurance.created_at), 'MMM dd, yyyy'),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search insurance..."
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Add Insurance"
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <InsuranceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        insurance={selectedInsurance}
        onSuccess={() => {
          setIsDialogOpen(false)
          router.refresh()
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Insurance"
        description="Are you sure you want to delete this insurance record? This action cannot be undone."
        isPending={isPending}
      />
    </>
  )
}
