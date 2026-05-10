import { getDashboardStats, getRecentAppointments, getRecentUsers } from '@/features/admin/actions'
import { DashboardContent } from './_components/DashboardContent'

export default async function AdminDashboard() {
  const statsResult = await getDashboardStats()
  const recentAppointmentsResult = await getRecentAppointments(5)
  const recentUsersResult = await getRecentUsers(5)

  const stats = statsResult.success
    ? {
        totalUsers: statsResult.totalUsers,
        totalProfessionals: statsResult.totalProfessionals,
        totalAppointments: statsResult.totalAppointments,
        totalEnquiries: statsResult.totalEnquiries,
        newsletterSubscribers: statsResult.newsletterSubscribers,
      }
    : {
        totalUsers: 0,
        totalProfessionals: 0,
        totalAppointments: 0,
        totalEnquiries: 0,
        newsletterSubscribers: 0,
      }

  const recentAppointments = recentAppointmentsResult.success ? recentAppointmentsResult.data : []
  const recentUsers = recentUsersResult.success ? recentUsersResult.data : []
  const loadError =
    (!statsResult.success ? statsResult.error : null) ??
    (!recentAppointmentsResult.success ? recentAppointmentsResult.error : null) ??
    (!recentUsersResult.success ? recentUsersResult.error : null) ??
    null

  return (
    <DashboardContent
      stats={stats}
      recentAppointments={recentAppointments}
      recentUsers={recentUsers}
      loadError={loadError}
    />
  )
}
