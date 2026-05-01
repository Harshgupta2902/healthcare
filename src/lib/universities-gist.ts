/** Public list of university / institution names (JSON array of strings). */
const UNIVERSITIES_GIST_URL =
  'https://gist.githubusercontent.com/snario/1e1d918d02f4d018bca6cb4c5f898bf4/raw/universities.json'

let cachedNames: string[] | null = null
let inflight: Promise<string[]> | null = null

/**
 * The public gist is not always strict JSON (some entries contain raw `"` inside strings).
 * When JSON.parse fails, recover one string per line: opening indent + `"` … final `",` or `"` EOL.
 */
function parseUniversitiesGistLoose(text: string): string[] {
  const names: string[] = []
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed === '[' || trimmed === ']' || trimmed === '') continue

    const withComma = /^\s*"(.*)",\s*$/.exec(line)
    const withoutComma = /^\s*"(.*)"\s*$/.exec(line)
    const m = withComma ?? withoutComma
    if (!m) continue

    const raw = m[1]
    try {
      const quoted = `"${raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
      names.push(JSON.parse(quoted) as string)
    } catch {
      names.push(raw)
    }
  }
  return names
}

export async function getUniversitiesNames(): Promise<string[]> {
  if (cachedNames) return cachedNames
  if (inflight) return inflight

  inflight = (async () => {
    const res = await fetch(UNIVERSITIES_GIST_URL, {
      next: { revalidate: 86_400 },
      headers: {
        Accept: 'application/json',
        'User-Agent': 'HealthcareApp/1.0 (university-directory)',
      },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[universities-gist] fetch failed', { status: res.status, body: body.slice(0, 200) })
      throw new Error(`Universities fetch failed: ${res.status}`)
    }
    const text = await res.text()
    let names: string[]
    try {
      const data: unknown = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error('Universities JSON is not an array')
      names = data.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    } catch (e) {
      console.warn('[universities-gist] strict JSON.parse failed, using line fallback', e)
      names = parseUniversitiesGistLoose(text).filter((x) => x.trim().length > 0)
      if (names.length === 0) throw e instanceof Error ? e : new Error('Universities parse failed')
    }
    cachedNames = names
    console.info('[universities-gist] loaded', { count: names.length })
    return names
  })()

  try {
    return await inflight
  } finally {
    inflight = null
  }
}

const MAX_RESULTS = 30

export function searchUniversityNames(names: string[], query: string): string[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const hits = names.filter((name) => name.toLowerCase().includes(q))
  hits.sort((a, b) => {
    const la = a.toLowerCase()
    const lb = b.toLowerCase()
    const ia = la.indexOf(q)
    const ib = lb.indexOf(q)
    if (ia !== ib) return ia - ib
    if (a.length !== b.length) return a.length - b.length
    return a.localeCompare(b)
  })
  return hits.slice(0, MAX_RESULTS)
}
