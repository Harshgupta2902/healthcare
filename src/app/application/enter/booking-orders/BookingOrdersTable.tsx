'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import type { BookingOrderAdminRow } from '@/features/admin/actions'
import { OrderStatusBadge } from '@/features/booking-orders/components/OrderStatusBadge'
import type { BookingOrderFailureReason, BookingOrderStatus } from '@/features/booking-orders/types'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { BookingOrderViewDialog } from './BookingOrderViewDialog'

interface BookingOrdersTableProps {
  initialData: BookingOrderAdminRow[]
  initialPage: number
  totalPages: number
  count: number
  initialStatus: string
}

export function BookingOrdersTable({
  initialData,
  initialPage,
  totalPages,
  count,
  initialStatus,
}: BookingOrdersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewOpen, setViewOpen] = useState(false)
  const [selected, setSelected] = useState<BookingOrderAdminRow | null>(null)

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    router.push(`/application/enter/booking-orders?${params.toString()}`)
  }

  const handleSearch = (query: string) => {
    pushParams({ search: query || null, page: '1' })
  }

  const handlePageChange = (page: number) => {
    pushParams({ page: String(page) })
  }

  const handleStatusChange = (value: string) => {
    pushParams({ status: value === 'all' ? null : value, page: '1' })
  }

  const columns = [
    {
      key: 'order_number',
      label: 'Order',
      render: (row: BookingOrderAdminRow) => (
        <span className="font-mono text-xs font-semibold">{row.order_number}</span>
      ),
    },
    {
      key: 'client',
      label: 'Patient',
      render: (row: BookingOrderAdminRow) => {
        const name =
          row.client?.name?.trim() ||
          `${row.booking_snapshot.firstName ?? ''} ${row.booking_snapshot.lastName ?? ''}`.trim()
        const email = row.client?.email || row.booking_snapshot.email || '—'
        return (
          <div className="min-w-[140px]">
            <p className="font-medium text-sm truncate">{name || '—'}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        )
      },
    },
    {
      key: 'professional',
      label: 'Consultant',
      render: (row: BookingOrderAdminRow) => (
        <span className="text-sm truncate max-w-[160px] block">
          {row.professional?.name || '—'}
        </span>
      ),
    },
    {
      key: 'amount_paise',
      label: 'Amount',
      render: (row: BookingOrderAdminRow) =>
        row.amount_paise > 0 ? `₹${(row.amount_paise / 100).toFixed(2)}` : 'Free',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: BookingOrderAdminRow) => (
        <OrderStatusBadge
          status={row.status as BookingOrderStatus}
          failureReason={row.failure_reason as BookingOrderFailureReason | null}
        />
      ),
    },
    {
      key: 'schedule',
      label: 'Slot',
      render: (row: BookingOrderAdminRow) => (
        <span className="text-xs whitespace-nowrap">
          {row.booking_snapshot.date || '—'} {row.booking_snapshot.time || ''}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (row: BookingOrderAdminRow) => (
        <span className="text-xs whitespace-nowrap">
          {format(new Date(row.created_at), 'MMM d, yyyy HH:mm')}
        </span>
      ),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search order # or failure reason…"
        onSearch={handleSearch}
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
        searchExtra={
          <Select value={initialStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        }
        renderRowActions={(row) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="View order"
            onClick={() => {
              setSelected(row)
              setViewOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />

      <BookingOrderViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        order={selected}
      />
    </>
  )
}
