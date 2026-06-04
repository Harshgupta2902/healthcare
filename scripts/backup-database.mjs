/**
 * Full Supabase Postgres backup → backup.sql (schema + data).
 *
 * Requires in .env:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_DB_PASSWORD=your-database-password
 *
 * Or DATABASE_URL=postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
 */
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outFile = resolve(root, 'backup.sql')

function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const env = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

const fileEnv = {
  ...loadEnvFile(join(root, '.env')),
  ...loadEnvFile(join(root, '.env.local')),
}
const env = { ...fileEnv, ...process.env }

function projectRefFromUrl(url) {
  const m = String(url || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)
  return m?.[1] ?? null
}

function resolveConnection() {
  if (env.DATABASE_URL?.startsWith('postgresql')) {
    const u = new URL(env.DATABASE_URL)
    return {
      host: u.hostname,
      port: u.port || '5432',
      database: u.pathname.replace(/^\//, '') || 'postgres',
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
    }
  }

  const ref =
    env.SUPABASE_PROJECT_REF ||
    projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL) ||
    projectRefFromUrl(env.SUPABASE_URL)

  const password = env.SUPABASE_DB_PASSWORD || env.POSTGRES_PASSWORD
  if (!ref) {
    throw new Error('Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_PROJECT_REF in .env')
  }
  if (!password) {
    throw new Error(
      'Set SUPABASE_DB_PASSWORD in .env (Supabase Dashboard → Project Settings → Database → Database password).',
    )
  }

  const poolerHost = env.SUPABASE_DB_HOST
  const poolerUser = env.SUPABASE_DB_USER || `postgres.${ref}`

  return {
    host: poolerHost || `db.${ref}.supabase.co`,
    port: env.SUPABASE_DB_PORT || '5432',
    database: env.SUPABASE_DB_NAME || 'postgres',
    user: poolerHost ? poolerUser : env.SUPABASE_DB_USER || 'postgres',
    password,
  }
}

function findPgDump() {
  const pgRoot = join('C:', 'Program Files', 'PostgreSQL')
  const versioned = []
  if (existsSync(pgRoot)) {
    for (const ver of ['17', '16', '15']) {
      const p = join(pgRoot, ver, 'bin', 'pg_dump.exe')
      if (existsSync(p)) versioned.push(p)
    }
  }

  const candidates = [
    process.env.PG_DUMP_PATH,
    ...versioned,
    join(homedir(), '.cache', 'pgdump', 'windows-latest-x64', 'pg_dump.exe'),
    'pg_dump',
  ].filter(Boolean)

  for (const p of candidates) {
    if (p === 'pg_dump' || existsSync(p)) return p
  }
  throw new Error(
    'pg_dump not found. Install PostgreSQL client tools or run: npm install --save-dev @louisbm/pgdump',
  )
}

const conn = resolveConnection()
const pgDump = findPgDump()

const args = [
  '--host',
  conn.host,
  '--port',
  String(conn.port),
  '--username',
  conn.user,
  '--dbname',
  conn.database,
  '--no-owner',
  '--no-acl',
  '--clean',
  '--if-exists',
  '--encoding=UTF8',
  '--file',
  outFile,
]

console.log(`Backing up ${conn.database}@${conn.host} → ${outFile}`)

const child = spawn(pgDump, args, {
  env: { ...process.env, PGPASSWORD: conn.password, PGSSLMODE: 'require' },
  stdio: 'inherit',
})

child.on('close', (code) => {
  if (code === 0) {
    console.log(`\nBackup saved: ${outFile}`)
    console.log('Restore: npm run db:restore (see docs/DATABASE_BACKUP_RESTORE.md)')
    process.exit(0)
  }
  console.error(`\npg_dump failed (exit ${code}). Check host, password, and network.`)
  process.exit(code ?? 1)
})
