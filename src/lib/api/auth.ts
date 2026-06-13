import { createClient as createSupabaseJsClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export function createApiSupabase(request: NextRequest): SupabaseClient {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null

  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}

export async function getApiUser(supabase: SupabaseClient): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

export async function requireApiUser(supabase: SupabaseClient): Promise<User | null> {
  return getApiUser(supabase)
}
