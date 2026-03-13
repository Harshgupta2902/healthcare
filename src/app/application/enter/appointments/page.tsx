import { getAppointments } from '@/features/admin/actions'
import { AppointmentsTable } from './AppointmentsTable'

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const { data, count } = await getAppointments(page, 10, search)
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Appointments Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage all appointments
        </p>
      </div>
      <AppointmentsTable initialData={data} initialPage={page} totalPages={totalPages} count={count || 0} />
    </div>
  )
}
