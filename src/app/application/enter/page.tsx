import type { Metadata } from 'next'
import { getDashboardStats, getRecentAppointments, getRecentUsers } from '@/features/admin/actions'
import { DashboardContent } from './_components/DashboardContent'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Admin overview',
  description: 'HealthHere admin dashboard: usage snapshot, recent appointments, and recent users.',
  pathname: '/application/enter',
  robots: ROBOTS_NOINDEX,
})

export default async function AdminDashboard() {
  const statsResult = await getDashboardStats()
  const recentAppointmentsResult = await getRecentAppointments(5)
  const recentUsersResult = await getRecentUsers(5)

  const stats = statsResult.success
    ? {
        totalUsers: statsResult.totalUsers,
        clientUsers: statsResult.clientUsers,
        totalProfessionals: statsResult.totalProfessionals,
        verifiedProfessionals: statsResult.verifiedProfessionals,
        totalAppointments: statsResult.totalAppointments,
        totalEnquiries: statsResult.totalEnquiries,
        newsletterSubscribers: statsResult.newsletterSubscribers,
        newsletterActive: statsResult.newsletterActive,
        newsletterResubscribed: statsResult.newsletterResubscribed,
        newsletterUnsubscribed: statsResult.newsletterUnsubscribed,
      }
    : {
        totalUsers: 0,
        clientUsers: 0,
        totalProfessionals: 0,
        verifiedProfessionals: 0,
        totalAppointments: 0,
        totalEnquiries: 0,
        newsletterSubscribers: 0,
        newsletterActive: 0,
        newsletterResubscribed: 0,
        newsletterUnsubscribed: 0,
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
