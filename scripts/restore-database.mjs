/**
 * Restore backup.sql into the database from .env (DATABASE_URL or SUPABASE_DB_PASSWORD).
 */
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const backupFile = resolve(root, process.argv[2] || 'backup.sql')

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
  if (!ref || !password) {
    throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD (or DATABASE_URL) in .env')
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

function findPsql() {
  for (const ver of ['17', '16', '15']) {
    const psql = join('C:', 'Program Files', 'PostgreSQL', ver, 'bin', 'psql.exe')
    if (existsSync(psql)) return psql
  }
  const dir = join(homedir(), '.cache', 'pgdump', 'windows-latest-x64')
  const psql = join(dir, 'psql.exe')
  if (existsSync(psql)) return psql
  return 'psql'
}

if (!existsSync(backupFile)) {
  console.error(`Missing ${backupFile}. Run: npm run db:backup`)
  process.exit(1)
}

const conn = resolveConnection()
const psql = findPsql()

console.log(`Restoring ${backupFile} → ${conn.database}@${conn.host}`)

const args = [
  '--host',
  conn.host,
  '--port',
  String(conn.port),
  '--username',
  conn.user,
  '--dbname',
  conn.database,
  '--file',
  backupFile,
  '--set',
  'ON_ERROR_STOP=1',
]

const child = spawn(psql, args, {
  env: { ...process.env, PGPASSWORD: conn.password, PGSSLMODE: 'require' },
  stdio: 'inherit',
})

child.on('close', (code) => {
  process.exit(code === 0 ? 0 : code ?? 1)
})
