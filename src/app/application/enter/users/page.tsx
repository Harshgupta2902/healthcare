import { getUsers } from '@/features/admin/actions'
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
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Users Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage client (patient) accounts. Providers are under Professionals.
        </p>
      </div>
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}
      <UsersTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
