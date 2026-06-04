'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { DeleteDialog } from '../_components/DeleteDialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  deleteAppointment,
  updateGuestAppointmentProfessional,
  type GuestAppointmentAdminRow,
} from '@/features/admin/actions'
import { CreateMeetingProgressDialog } from './CreateMeetingProgressDialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CalendarCheck, Copy, Trash2 } from 'lucide-react'

type GuestAppointmentRow = GuestAppointmentAdminRow

type ProfessionalOption = { id: string; name: string; email: string }

function GuestProfessionalSelect({
  row,
  professionals,
  pendingRowId,
  setPendingRowId,
  onUpdated,
}: {
  row: GuestAppointmentRow
  professionals: ProfessionalOption[]
  pendingRowId: string | null
  setPendingRowId: (id: string | null) => void
  onUpdated: () => void
}) {
  if (row.professional_id) {
    const fromList = professionals.find((p) => p.id === row.professional_id)
    const name = (row.professional?.name?.trim() || fromList?.name?.trim() || '').trim()
    const email = (row.professional?.email || fromList?.email || '').trim()
    const display =
      name && email && name.toLowerCase() !== email.toLowerCase()
        ? `${name} (${email})`
        : name || email || '—'
    return (
      <div className="min-w-[200px] max-w-[280px]">
        <p className="font-medium text-sm truncate" title={display}>
          {display}
        </p>
      </div>
    )
  }

  const handleValueChange = async (val: string) => {
    setPendingRowId(row.id)
    try {
      const res = await updateGuestAppointmentProfessional({
        guestAppointmentId: row.id,
        professionalId: val,
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success('Consultant saved on this request.')
      onUpdated()
    } finally {
      setPendingRowId(null)
    }
  }

  return (
    <div className="min-w-[200px] max-w-[300px]">
      <Select onValueChange={handleValueChange} disabled={pendingRowId === row.id}>
        <SelectTrigger className="w-full rounded-xl h-10 bg-white/50 dark:bg-gray-800/50 border-lp-outline-variant/40 dark:border-white/10 text-left">
          <SelectValue placeholder="Assign consultant…" />
        </SelectTrigger>
        <SelectContent className="rounded-xl max-h-72">
          {professionals.map((p) => (
            <SelectItem key={p.id} value={p.id} className="rounded-lg">
              {p.name || p.email} ({p.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function GuestTableRowActions({
  row,
  onDelete,
  onCreateMeeting,
}: {
  row: GuestAppointmentRow
  onDelete: (row: GuestAppointmentRow) => void
  onCreateMeeting: (row: GuestAppointmentRow) => void
}) {
  const hasLink = Boolean(row.calendar_invite_url?.trim())
  const guestEmail = row.email?.trim()
  const profEmail = row.professional?.email?.trim()
  const canBuild = Boolean(guestEmail && profEmail && !hasLink)

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const handleCopySaved = async () => {
    const u = row.calendar_invite_url?.trim()
    if (!u) return
    try {
      await copyText(u)
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {hasLink ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-lg"
            title="Copy meeting link"
            onClick={handleCopySaved}
          >
            <Copy className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-lg"
            disabled={!canBuild}
            title={
              canBuild
                ? 'Create meeting link and email invites to patient and consultant'
                : 'Assign a consultant (with email) to create a meeting'
            }
            onClick={() => onCreateMeeting(row)}
          >
            <CalendarCheck className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(row)}
          className="rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}

interface AppointmentsTableProps {
  initialData: GuestAppointmentRow[]
  initialPage: number
  totalPages: number
  count: number
  professionals: ProfessionalOption[]
}

export function AppointmentsTable({
  initialData,
  initialPage,
  totalPages,
  count,
  professionals,
}: AppointmentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<GuestAppointmentRow | null>(null)
  const [pendingRowId, setPendingRowId] = useState<string | null>(null)
  const [meetingDialog, setMeetingDialog] = useState<{
    guestAppointmentId: string
    patientLabel: string
    sessionKey: number
  } | null>(null)

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

  const handleDelete = (row: GuestAppointmentRow) => {
    setSelectedRow(row)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return

    startTransition(async () => {
      try {
        const result = await deleteAppointment(selectedRow.id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('Guest request removed')
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed to delete'
        toast.error(msg)
      }
    })
  }

  const columns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (row: GuestAppointmentRow) => (
        <div>
          <p className="font-medium">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-xs text-muted-foreground">Age {row.age}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (row: GuestAppointmentRow) => (
        <div className="text-sm">
          <p className="truncate max-w-[180px]" title={row.email}>
            {row.email}
          </p>
          <p className="text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (row: GuestAppointmentRow) => (
        <span className="text-sm">
          {row.city}, {row.state}
        </span>
      ),
    },
    {
      key: 'request',
      label: 'Request',
      render: (row: GuestAppointmentRow) => (
        <div className="text-sm space-y-0.5">
          <p className="font-medium">{row.category}</p>
          <p className="text-muted-foreground">
            {format(new Date(row.appointment_date), 'MMM d, yyyy')} · {row.appointment_time}
          </p>
        </div>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      render: (row: GuestAppointmentRow) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]" title={row.message ?? ''}>
          {row.message?.trim() ? row.message : '—'}
        </span>
      ),
    },
    {
      key: 'professional',
      label: 'Consultant',
      render: (row: GuestAppointmentRow) => (
        <GuestProfessionalSelect
          row={row}
          professionals={professionals}
          pendingRowId={pendingRowId}
          setPendingRowId={setPendingRowId}
          onUpdated={() => router.refresh()}
        />
      ),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search name, email, phone, city, category…"
        onSearch={handleSearch}
        renderRowActions={(row) => (
          <GuestTableRowActions
            row={row}
            onDelete={handleDelete}
            onCreateMeeting={(r) =>
              setMeetingDialog({
                guestAppointmentId: r.id,
                patientLabel: `${r.first_name} ${r.last_name}`.trim(),
                sessionKey: Date.now(),
              })
            }
          />
        )}
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete guest request"
        description="Remove this public booking request from the list? This cannot be undone."
        isPending={isPending}
      />
      {meetingDialog ? (
        <CreateMeetingProgressDialog
          open
          onOpenChange={(open) => {
            if (!open) setMeetingDialog(null)
          }}
          guestAppointmentId={meetingDialog.guestAppointmentId}
          patientLabel={meetingDialog.patientLabel}
          sessionKey={meetingDialog.sessionKey}
          onComplete={() => router.refresh()}
        />
      ) : null}
    </>
  )
}
