import { getAdminPayments } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { PaymentsTable } from './PaymentsTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Payments',
  description: 'Successful consultation payments recorded from confirmed booking orders.',
  pathname: '/application/enter/payments',
  robots: ROBOTS_NOINDEX,
})

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const search = params.search || ''

  const result = await getAdminPayments(page, 10, search)
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.max(1, Math.ceil((count || 0) / 10))

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Payments" />
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {result.error}
        </p>
      )}
      <PaymentsTable
        initialData={data}
        initialPage={page}
        totalPages={totalPages}
        count={count || 0}
      />
    </div>
  )
}
