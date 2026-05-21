'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { ProfessionalDialog } from './ProfessionalDialog'
import { DeleteDialog } from '../_components/DeleteDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { deleteProfessional, deleteUser, setProfessionalVerified } from '@/features/admin/actions'
import { combineInternationalPhone } from '@/lib/phone-country-options'
import { toast } from 'sonner'
import { Edit, Trash2, ShieldCheck, Loader2, Ban } from 'lucide-react'

interface Professional {
  id: string
  user_id: string
  name: string | null
  email: string
  phone: string | null
  phone_country_code: string | null
  image: string | null
  specialization: string
  license_number: string
  bio: string | null
  years_of_experience: number | null
  consultation_fee: number | null
  is_verified: boolean
  city: string | null
  created_at: string
}

function professionalInitialLetter(p: Professional): string {
  const name = p.name?.trim()
  if (name) return name[0].toUpperCase()
  const email = p.email?.trim()
  if (email) return email[0].toUpperCase()
  return '?'
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
  const [verifyMutatingId, setVerifyMutatingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)

  const hasProfileRow = (p: Professional) => Boolean(p.id)

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

  const runVerifyToggle = (professional: Professional, verified: boolean) => {
    if (!professional.id) return
    setVerifyMutatingId(professional.id)
    startTransition(async () => {
      try {
        const result = await setProfessionalVerified(professional.id, verified)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success(verified ? 'Professional verified' : 'Professional unverified')
        router.refresh()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Update failed')
      } finally {
        setVerifyMutatingId(null)
      }
    })
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProfessional) return

    startTransition(async () => {
      try {
        if (hasProfileRow(selectedProfessional)) {
          const result = await deleteProfessional(selectedProfessional.id)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Professional profile deleted')
        } else {
          const result = await deleteUser(selectedProfessional.user_id)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('User removed')
        }
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Delete failed')
      }
    })
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (professional: Professional) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0 border border-lp-outline-variant/40 dark:border-gray-600">
            <AvatarImage src={professional.image || undefined} alt={professional.name || professional.email} />
            <AvatarFallback className="bg-gradient-to-br from-lp-brand to-lp-brand-bright text-xs font-bold text-white">
              {professionalInitialLetter(professional)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium truncate">{professional.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (professional: Professional) => (
        <span className="text-sm truncate max-w-[220px] inline-block" title={professional.email}>
          {professional.email}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (professional: Professional) => {
        const display = combineInternationalPhone(professional.phone_country_code, professional.phone)
        return display ? (
          <span className="text-sm tabular-nums">{display}</span>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      },
    },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (professional: Professional) =>
        professional.specialization?.trim() ? professional.specialization : '—',
    },
    {
      key: 'license_number',
      label: 'License',
      render: (professional: Professional) =>
        professional.license_number?.trim() ? professional.license_number : '—',
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
        searchPlaceholder="Search by name or email..."
        onSearch={handleSearch}
        onAdd={handleAdd}
        getRowKey={(p) => p.user_id}
        renderRowActions={(professional) => (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {hasProfileRow(professional) && professional.is_verified ? (
              <>
                <Badge
                  variant="default"
                  className="rounded-lg gap-1 pl-2 pr-2.5 py-1 font-semibold bg-emerald-600 hover:bg-emerald-600"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  Verified
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-lg font-semibold cursor-pointer"
                  disabled={isPending && verifyMutatingId === professional.id}
                  onClick={() => runVerifyToggle(professional, false)}
                  aria-label="Unverify professional"
                >
                  {isPending && verifyMutatingId === professional.id ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                  ) : (
                    <Ban className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </Button>
              </>
            ) : null}
            {hasProfileRow(professional) && !professional.is_verified ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg gap-1.5 border-lp-outline-variant/50 font-semibold text-lp-brand hover:bg-lp-surface-container-low"
                disabled={isPending && verifyMutatingId === professional.id}
                onClick={() => runVerifyToggle(professional, true)}
              >
                {isPending && verifyMutatingId === professional.id ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                ) : null}
                Verify User
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(professional)}
              className="rounded-lg hover:bg-lp-surface-container/80 dark:hover:bg-white/5"
              aria-label="Edit professional"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(professional)}
              className="rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              aria-label={
                hasProfileRow(professional)
                  ? 'Delete professional profile'
                  : 'Delete provider user'
              }
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
        addLabel="Add Professional"
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <ProfessionalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        professional={
          selectedProfessional
            ? {
                id: selectedProfessional.id || undefined,
                user_id: selectedProfessional.user_id,
                specialization: selectedProfessional.specialization,
                license_number: selectedProfessional.license_number,
                bio: selectedProfessional.bio,
                years_of_experience: selectedProfessional.years_of_experience,
                consultation_fee: selectedProfessional.consultation_fee,
                is_verified: selectedProfessional.is_verified,
                city: selectedProfessional.city,
              }
            : null
        }
        onSuccess={() => {
          setIsDialogOpen(false)
          router.refresh()
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title={
          selectedProfessional && hasProfileRow(selectedProfessional)
            ? 'Delete professional profile'
            : 'Delete provider user'
        }
        description={
          selectedProfessional && hasProfileRow(selectedProfessional)
            ? 'Removes only the provider profile row. The account remains in Users until you delete it there.'
            : 'Removes this row from public.users. If it fails (FK), delete the user from Supabase Authentication first.'
        }
        isPending={isPending}
      />
    </>
  )
}
