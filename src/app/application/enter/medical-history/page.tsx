import { getMedicalHistory } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { MedicalHistoryTable } from './MedicalHistoryTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Medical History Management',
  description:
    'Medical History Management: admin review of client medical history records in HealthHere.',
  pathname: '/application/enter/medical-history',
  robots: ROBOTS_NOINDEX,
})

export default async function MedicalHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const result = await getMedicalHistory(page, 10, search)
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Medical History Management"
        description="Manage patient medical history records"
      />
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}
      <MedicalHistoryTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
