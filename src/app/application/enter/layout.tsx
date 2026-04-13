import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './_components/AdminSidebar'
import { AdminNavbar } from './_components/AdminNavbar'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-clip">
      <div className="flex h-screen overflow-hidden min-w-0">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <AdminNavbar user={userData} />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-clip p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
