'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import type { BookingOrderAdminRow } from '@/features/admin/actions'
import { OrderStatusBadge } from '@/features/booking-orders/components/OrderStatusBadge'
import type { BookingOrderFailureReason, BookingOrderStatus } from '@/features/booking-orders/types'

export function BookingOrderViewDialog({
  open,
  onOpenChange,
  order,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: BookingOrderAdminRow | null
}) {
  if (!order) return null

  const snap = order.booking_snapshot

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{order.order_number}</DialogTitle>
          <DialogDescription>Booking order details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge
              status={order.status as BookingOrderStatus}
              failureReason={order.failure_reason as BookingOrderFailureReason | null}
            />
            <span className="font-semibold">
              {order.amount_paise > 0
                ? `₹${(order.amount_paise / 100).toFixed(2)}`
                : 'Free'}
            </span>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Patient" value={order.client?.name || `${snap.firstName ?? ''} ${snap.lastName ?? ''}`.trim()} />
            <Detail label="Email" value={order.client?.email || snap.email} />
            <Detail label="Phone" value={snap.phone} />
            <Detail label="Consultant" value={order.professional?.name} />
            <Detail label="Category" value={snap.category} />
            <Detail label="Location" value={[snap.city, snap.state].filter(Boolean).join(', ')} />
            <Detail label="Date" value={snap.date} />
            <Detail label="Time" value={snap.time} />
            <Detail label="Provider" value={order.payment_provider} />
            <Detail label="Txn ID" value={order.provider_payment_id} />
            <Detail
              label="Expires"
              value={order.expires_at ? format(new Date(order.expires_at), 'MMM d, yyyy HH:mm') : null}
            />
            <Detail
              label="Paid"
              value={order.paid_at ? format(new Date(order.paid_at), 'MMM d, yyyy HH:mm') : null}
            />
            <Detail
              label="Confirmed"
              value={order.confirmed_at ? format(new Date(order.confirmed_at), 'MMM d, yyyy HH:mm') : null}
            />
            <Detail
              label="Created"
              value={format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}
            />
            <Detail label="Appointment ID" value={order.guest_appointment_id} className="sm:col-span-2 font-mono text-xs" />
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Detail({
  label,
  value,
  className,
}: {
  label: string
  value?: string | null
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-all">{value?.trim() || '—'}</dd>
    </div>
  )
}
