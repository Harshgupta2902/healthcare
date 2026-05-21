import { getContactMessages } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { EnquiriesTable } from './EnquiriesTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Enquiries',
  description:
    'Enquiries: read and respond to inbound contact messages and support requests for the HealthHere platform.',
  pathname: '/application/enter/enquiries',
  robots: ROBOTS_NOINDEX,
})

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const search = params.search || ''
  const result = await getContactMessages(page, 10, search)
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Enquiries" />
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {result.error}
        </p>
      )}
      <EnquiriesTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
