'use server'

import { createClient } from '@/lib/supabase/server'

export type BlogEngagementUser = {
  id: string
  name: string
  image: string | null
  role: 'client' | 'professional'
}

export async function getBlogSessionUser(): Promise<BlogEngagementUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('id, name, image, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['client', 'professional'].includes(profile.role)) return null
  return profile as BlogEngagementUser
}

export async function requireBlogEngagementUser(): Promise<
  { ok: true; user: BlogEngagementUser } | { ok: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'Sign in to comment or like this article.' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, name, image, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['client', 'professional'].includes(profile.role)) {
    return { ok: false, error: 'Only signed-in patients and consultants can comment or like.' }
  }

  return { ok: true, user: profile as BlogEngagementUser }
}

export async function requireAdminForBlogPreview(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authorized.' }

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!userData || userData.role !== 'admin') return { ok: false, error: 'Not authorized.' }
  return { ok: true }
}
