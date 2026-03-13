import { getDocuments } from '@/features/admin/actions'
import { DocumentsTable } from './DocumentsTable'

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const { data, count } = await getDocuments(page, 10, search)
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Documents Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage medical documents
        </p>
      </div>
      <DocumentsTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
