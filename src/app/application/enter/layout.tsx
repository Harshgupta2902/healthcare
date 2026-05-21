import type { Metadata } from "next";
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './_components/AdminSidebar'
import { AdminNavbar } from './_components/AdminNavbar'
import { getAdminUnreadNotificationCount } from '@/features/admin/actions'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role, name, email, image')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    redirect('/')
  }

  const unreadNotificationCount = await getAdminUnreadNotificationCount()

  return (
    <div className="relative min-h-screen overflow-x-clip bg-lp-surface font-sans text-lp-on-surface">
      <div className="admin-ambient-blob admin-ambient-blob-a" aria-hidden />
      <div className="admin-ambient-blob admin-ambient-blob-b" aria-hidden />
      <div className="admin-ambient-blob admin-ambient-blob-c" aria-hidden />
      <div className="relative z-10 flex h-screen overflow-hidden min-w-0">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminNavbar user={userData} unreadNotificationCount={unreadNotificationCount} />
          <main className="relative z-10 min-w-0 flex-1 overflow-y-auto overflow-x-clip p-4 pb-24 sm:p-5 md:p-6 lg:p-8 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
