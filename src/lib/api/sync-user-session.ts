import type { SupabaseClient, User } from '@supabase/supabase-js'

export type SyncedUserData = {
  id: string
  name: string
  email: string
  role: string
}

export async function syncUserSessionForApi(
  supabase: SupabaseClient,
  user: User,
): Promise<SyncedUserData | null> {
  const { data: existingUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const finalRole = user.user_metadata?.role || existingUser?.role || 'client'

  const { error: upsertError } = await supabase.from('users').upsert({
    id: user.id,
    name: user.user_metadata?.name || user.email,
    email: user.email,
    role: finalRole,
    image: user.user_metadata?.image || user.user_metadata?.avatar_url || null,
    updated_at: new Date().toISOString(),
  })

  if (upsertError) {
    console.error('[api/sync-session] upsert failed:', upsertError.message)
  }

  await supabase.auth.updateUser({
    data: { role: finalRole },
  })

  return {
    id: user.id,
    name: user.user_metadata?.name || user.email || '',
    email: user.email || '',
    role: finalRole,
  }
}
