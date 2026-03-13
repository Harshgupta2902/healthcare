import { getUsers } from '@/features/admin/actions'
import { UsersTable } from './UsersTable'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const { data, count } = await getUsers(page, 10, search)
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Users Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage all system users
        </p>
      </div>
      <UsersTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
