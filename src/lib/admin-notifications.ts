import type { SupabaseClient } from '@supabase/supabase-js'

export type AdminNotificationInsert = {
  actorUserId: string
  type: string
  title: string
  body?: string | null
  metadata?: Record<string, unknown>
}

export type FieldChange = { label: string; from: unknown; to: unknown }

export function formatFieldValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  const s = String(v).trim()
  return s.length ? s : '—'
}

/** One sentence per change: "Name has updated {label} from {old} to {new}." */
export function buildProfessionalChangeBody(actorName: string, changes: FieldChange[]): string {
  const lines: string[] = []
  for (const c of changes) {
    const from = formatFieldValue(c.from)
    const to = formatFieldValue(c.to)
    if (from === to) continue
    lines.push(`${actorName} has updated ${c.label} from ${from} to ${to}.`)
  }
  if (!lines.length) {
    return `${actorName} saved changes (no tracked field differences detected).`
  }
  return lines.join('\n')
}

const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export function weekdayLong(day: number): string {
  if (day < 0 || day > 6) return `Day ${day}`
  return WEEKDAY_LONG[day]
}

/**
 * Logs dashboard activity for professionals with readable old→new lines.
 * Uses explicit `body` when provided; otherwise builds from `changes`.
 */
export async function recordProfessionalActivity(
  supabase: SupabaseClient,
  input: {
    actorUserId: string
    type: string
    title: string
    changes?: FieldChange[]
    body?: string | null
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  const { data: u, error } = await supabase
    .from('users')
    .select('name, role')
    .eq('id', input.actorUserId)
    .maybeSingle()

  if (error || !u) {
    console.warn('[recordProfessionalActivity] skip: user not found', input.actorUserId)
    return
  }

  const actorName = (u.name || 'User').trim() || 'User'
  const body =
    input.body !== undefined && input.body !== null
      ? input.body
      : input.changes?.length
        ? buildProfessionalChangeBody(actorName, input.changes)
        : null

  await recordAdminNotification(supabase, {
    actorUserId: input.actorUserId,
    type: input.type,
    title: input.title,
    body,
    metadata: {
      actor_name: actorName,
      actor_role: u.role,
      ...(input.changes?.length ? { changes: input.changes } : {}),
      ...input.metadata,
    },
  })
}

/**
 * Inserts a row for admins to review. RLS requires `actor_user_id = auth.uid()`.
 * Skips when the actor is an admin (avoids noise from admin self-actions).
 */
export async function recordAdminNotification(
  supabase: SupabaseClient,
  input: AdminNotificationInsert,
): Promise<void> {
  const { data: actor, error: actorErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', input.actorUserId)
    .maybeSingle()

  if (actorErr || !actor) {
    console.warn('[recordAdminNotification] skip: actor not found', input.actorUserId, actorErr?.message)
    return
  }
  if (actor.role === 'admin') return

  const { error } = await supabase.from('admin_notifications').insert({
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    actor_user_id: input.actorUserId,
    metadata: input.metadata ?? {},
  })

  if (error) {
    console.error('[recordAdminNotification]', error.message)
  }
}
