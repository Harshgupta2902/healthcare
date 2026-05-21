import { getMedications } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { MedicationsTable } from './MedicationsTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Medications Management',
  description:
    'Medications Management: admin oversight of medication records associated with HealthHere users.',
  pathname: '/application/enter/medications',
  robots: ROBOTS_NOINDEX,
})

export default async function MedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const result = await getMedications(page, 10, search)
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Medications Management" />
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}
      <MedicationsTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
