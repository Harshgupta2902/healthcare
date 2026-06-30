'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { PaymentAdminRow } from '@/features/admin/actions'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { PaymentViewDialog } from './PaymentViewDialog'
import { Badge } from '@/components/ui/badge'

interface PaymentsTableProps {
  initialData: PaymentAdminRow[]
  initialPage: number
  totalPages: number
  count: number
}

export function PaymentsTable({
  initialData,
  initialPage,
  totalPages,
  count,
}: PaymentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewOpen, setViewOpen] = useState(false)
  const [selected, setSelected] = useState<PaymentAdminRow | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) params.set('search', query)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/application/enter/payments?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/payments?${params.toString()}`)
  }

  const columns = [
    {
      key: 'order_number',
      label: 'Order',
      render: (row: PaymentAdminRow) => (
        <span className="font-mono text-xs font-semibold">{row.order_number || '—'}</span>
      ),
    },
    {
      key: 'client',
      label: 'Patient',
      render: (row: PaymentAdminRow) => (
        <div className="min-w-[140px]">
          <p className="font-medium text-sm truncate">{row.client?.name || '—'}</p>
          <p className="text-xs text-muted-foreground truncate">{row.client?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'professional',
      label: 'Consultant',
      render: (row: PaymentAdminRow) => (
        <span className="text-sm truncate max-w-[160px] block">
          {row.professional?.name || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row: PaymentAdminRow) => (
        <span className="font-semibold">₹{(row.amount / 100).toFixed(2)}</span>
      ),
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (row: PaymentAdminRow) => (
        <span className="capitalize text-sm">{row.payment_method}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: PaymentAdminRow) => (
        <Badge className="bg-emerald-100 text-emerald-700 border-none font-semibold capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Paid at',
      render: (row: PaymentAdminRow) => (
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
        searchPlaceholder="Search transaction ID or method…"
        onSearch={handleSearch}
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
        renderRowActions={(row) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="View payment"
            onClick={() => {
              setSelected(row)
              setViewOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />

      <PaymentViewDialog open={viewOpen} onOpenChange={setViewOpen} payment={selected} />
    </>
  )
}
