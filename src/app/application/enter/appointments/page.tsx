import { getAppointments, getProfessionalsForDropdown } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { AppointmentsTable } from './AppointmentsTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Guest appointments',
  description:
    'Guest appointments: review public booking requests from HealthHere book consultation, assign consultants, and manage calendar links.',
  pathname: '/application/enter/appointments',
  robots: ROBOTS_NOINDEX,
})

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const [apptRes, prosRes] = await Promise.all([
    getAppointments(page, 10, search),
    getProfessionalsForDropdown(),
  ])

  const data = apptRes.success ? apptRes.data : []
  const count = apptRes.success ? apptRes.count : 0
  const totalPages = Math.ceil((count || 0) / 10)
  const professionals = prosRes.success ? prosRes.data : []

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Guest appointments" />
      {!apptRes.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{apptRes.error}</p>
      )}
      {!prosRes.success && (
        <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">
          Could not load professional list: {prosRes.error}
        </p>
      )}
      <AppointmentsTable
        initialData={data}
        initialPage={page}
        totalPages={totalPages}
        count={count || 0}
        professionals={professionals}
      />
    </div>
  )
}
