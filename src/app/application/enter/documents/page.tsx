import { getDocuments, getQualificationCredentialsForAdmin } from '@/features/admin/actions'
import { DocumentsManagementTabs } from './DocumentsManagementTabs'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Documents Management',
  description:
    'Documents Management: admin tools for uploaded files, qualification credentials, and document approvals on HealthHere.',
  pathname: '/application/enter/documents',
  robots: ROBOTS_NOINDEX,
})

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; qpage?: string; qsearch?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10) || 1
  const search = params.search || ''
  const qpage = parseInt(params.qpage || '1', 10) || 1
  const qsearch = params.qsearch || ''

  const [docsResult, qualsResult] = await Promise.all([
    getDocuments(page, 10, search),
    getQualificationCredentialsForAdmin(qpage, 10, qsearch),
  ])

  const medicalData = docsResult.success ? docsResult.data : []
  const medicalCount = docsResult.success ? docsResult.count : 0
  const medicalTotalPages = Math.ceil((medicalCount || 0) / 10)

  const qualData = qualsResult.success ? qualsResult.data : []
  const qualCount = qualsResult.success ? qualsResult.count : 0
  const qualTotalPages = Math.ceil((qualCount || 0) / 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Documents Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Patient medical documents and professional qualification verification files
        </p>
      </div>

      <DocumentsManagementTabs
        medical={{
          data: medicalData,
          page,
          totalPages: medicalTotalPages,
          count: medicalCount || 0,
          error: docsResult.success ? null : docsResult.error,
        }}
        qualifications={{
          data: qualData,
          page: qpage,
          totalPages: qualTotalPages,
          count: qualCount || 0,
          error: qualsResult.success ? null : qualsResult.error,
        }}
      />
    </div>
  )
}
