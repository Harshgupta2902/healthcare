import { getMedications } from '@/features/admin/actions'
import { MedicationsTable } from './MedicationsTable'

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
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Medications Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage patient medications
        </p>
      </div>
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}
      <MedicationsTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
