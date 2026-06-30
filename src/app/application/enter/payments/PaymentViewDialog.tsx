'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { PaymentAdminRow } from '@/features/admin/actions'

export function PaymentViewDialog({
  open,
  onOpenChange,
  payment,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: PaymentAdminRow | null
}) {
  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Payment details</DialogTitle>
          <DialogDescription>
            {payment.order_number || payment.booking_order_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-bold">₹{(payment.amount / 100).toFixed(2)}</span>
            <Badge className="bg-emerald-100 text-emerald-700 border-none capitalize">
              {payment.status}
            </Badge>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Order" value={payment.order_number} />
            <Detail label="Method" value={payment.payment_method} />
            <Detail label="Transaction ID" value={payment.transaction_id} className="sm:col-span-2 font-mono text-xs" />
            <Detail label="Patient" value={payment.client?.name} />
            <Detail label="Patient email" value={payment.client?.email} />
            <Detail label="Consultant" value={payment.professional?.name} />
            <Detail label="Consultant email" value={payment.professional?.email} />
            <Detail
              label="Paid at"
              value={format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
            />
            <Detail label="Appointment ID" value={payment.guest_appointment_id} className="sm:col-span-2 font-mono text-xs" />
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
