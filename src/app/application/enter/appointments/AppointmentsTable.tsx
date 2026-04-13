'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { AppointmentDialog } from './AppointmentDialog'
import { DeleteDialog } from '../_components/DeleteDialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { deleteAppointment } from '@/features/admin/actions'
import { toast } from 'sonner'

interface Appointment {
  id: string
  client_id: string
  professional_id: string
  appointment_type: string
  status: string
  start_time: string
  end_time: string
  notes: string | null
  meeting_url: string | null
  client?: { name: string | null; email: string }
  professional?: { name: string | null; email: string }
}

interface AppointmentsTableProps {
  initialData: Appointment[]
  initialPage: number
  totalPages: number
  count: number
}

export function AppointmentsTable({ initialData, initialPage, totalPages, count }: AppointmentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/application/enter/appointments?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/appointments?${params.toString()}`)
  }

  const handleAdd = () => {
    setSelectedAppointment(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  const handleDelete = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAppointment) return

    startTransition(async () => {
      try {
        const result = await deleteAppointment(selectedAppointment.id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('Appointment deleted successfully')
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete appointment')
      }
    })
  }

  const columns = [
    {
      key: 'client',
      label: 'Client',
      render: (appointment: Appointment) => appointment.client?.name || 'N/A',
    },
    {
      key: 'professional',
      label: 'Professional',
      render: (appointment: Appointment) => appointment.professional?.name || 'N/A',
    },
    {
      key: 'appointment_type',
      label: 'Type',
    },
    {
      key: 'start_time',
      label: 'Date & Time',
      render: (appointment: Appointment) => format(new Date(appointment.start_time), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (appointment: Appointment) => (
        <Badge
          variant={
            appointment.status === 'completed'
              ? 'default'
              : appointment.status === 'confirmed'
              ? 'default'
              : appointment.status === 'cancelled'
              ? 'destructive'
              : 'secondary'
          }
          className="capitalize"
        >
          {appointment.status}
        </Badge>
      ),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search appointments..."
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Add Appointment"
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <AppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        appointment={selectedAppointment}
        onSuccess={() => {
          setIsDialogOpen(false)
          router.refresh()
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment? This action cannot be undone."
        isPending={isPending}
      />
    </>
  )
}
