import { getAdminBookingOrders } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { BookingOrdersTable } from './BookingOrdersTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Booking orders',
  description: 'Review consultation booking orders: pending payment, confirmed, and failed.',
  pathname: '/application/enter/booking-orders',
  robots: ROBOTS_NOINDEX,
})

export default async function AdminBookingOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const search = params.search || ''
  const status = params.status || 'all'

  const result = await getAdminBookingOrders(page, 10, search, status)
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.max(1, Math.ceil((count || 0) / 10))

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Booking orders" />
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {result.error}
        </p>
      )}
      <BookingOrdersTable
        initialData={data}
        initialPage={page}
        totalPages={totalPages}
        count={count || 0}
        initialStatus={status}
      />
    </div>
  )
}
