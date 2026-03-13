import { getDashboardStats, getRecentAppointments, getRecentUsers } from '@/features/admin/actions'
import { DashboardContent } from './_components/DashboardContent'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  const recentAppointments = await getRecentAppointments(5)
  const recentUsers = await getRecentUsers(5)

  return (
    <DashboardContent
      stats={stats}
      recentAppointments={recentAppointments}
      recentUsers={recentUsers}
    />
  )
}
