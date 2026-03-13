import { getMedicalHistory } from '@/features/admin/actions'
import { MedicalHistoryTable } from './MedicalHistoryTable'

export default async function MedicalHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const { data, count } = await getMedicalHistory(page, 10, search)
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Medical History Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage patient medical history records
        </p>
      </div>
      <MedicalHistoryTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
