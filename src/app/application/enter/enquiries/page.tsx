import { getContactMessages } from '@/features/admin/actions'
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
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Enquiries
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Messages submitted from the public contact page
        </p>
      </div>
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {result.error}
        </p>
      )}
      <EnquiriesTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
