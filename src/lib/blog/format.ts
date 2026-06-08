export function formatBlogCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export function formatBlogDate(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}

export function estimateReadMinutes(content: string): number {
  const plain = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~\[\]()!|-]/g, ' ')
  const words = plain.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
