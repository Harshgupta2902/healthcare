import { getUsers } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { UsersTable } from './UsersTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Users Management',
  description:
    'Users Management: search and maintain HealthHere accounts, roles, and access for patients and professionals.',
  pathname: '/application/enter/users',
  robots: ROBOTS_NOINDEX,
})

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const result = await getUsers(page, 10, search)
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users Management"
        description="Manage client (patient) accounts. Providers are under Professionals."
      />
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}
      <UsersTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
