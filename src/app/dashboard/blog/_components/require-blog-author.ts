import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireDashboardBlogAuthor() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/blog')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role === 'admin') {
    redirect('/application/enter/blog')
  }

  if (!['client', 'professional'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return { user, role: profile.role as 'client' | 'professional', name: profile.name }
}
