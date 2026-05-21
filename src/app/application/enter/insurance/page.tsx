import { getInsurance } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { InsuranceTable } from './InsuranceTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Insurance Management',
  description:
    'Insurance Management: review and maintain insurance records tied to HealthHere patient profiles.',
  pathname: '/application/enter/insurance',
  robots: ROBOTS_NOINDEX,
})

export default async function InsurancePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const result = await getInsurance(page, 10, search)
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Insurance Management" />
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}
      <InsuranceTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
