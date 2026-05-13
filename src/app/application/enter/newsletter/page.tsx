import Link from 'next/link'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getNewsletterSubscribers, getNewsletterActiveRecipientCount } from '@/features/admin/actions'
import { NewsletterTable } from './NewsletterTable'
import type { SubscriberStatus } from './StatusFilter'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Newsletter',
  description: 'Admin: manage newsletter subscribers and delivery health.',
  pathname: '/application/enter/newsletter',
  robots: ROBOTS_NOINDEX,
})

const ALLOWED_STATUSES = ['active', 'resubscribed', 'unsubscribed'] as const satisfies readonly SubscriberStatus[]
const DEFAULT_STATUSES: SubscriberStatus[] = ['active', 'resubscribed']

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; statuses?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const parsedStatuses: SubscriberStatus[] =
    typeof params.statuses === 'string' && params.statuses.length > 0
      ? params.statuses
          .split(',')
          .map((s) => s.trim())
          .filter((s): s is SubscriberStatus =>
            (ALLOWED_STATUSES as readonly string[]).includes(s),
          )
      : DEFAULT_STATUSES
  const statuses: SubscriberStatus[] = parsedStatuses.length > 0 ? parsedStatuses : DEFAULT_STATUSES
  const [result, countRes] = await Promise.all([
    getNewsletterSubscribers(page, 10, search, statuses),
    getNewsletterActiveRecipientCount(),
  ])
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.ceil((count || 0) / 10)
  const activeRecipientCount = countRes.success ? countRes.count : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Newsletter Subscribers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage newsletter subscribers and send broadcasts to active contacts.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl gap-2">
          <Link href="/application/enter/newsletter/campaigns">
            <Send className="w-4 h-4" />
            View campaigns
          </Link>
        </Button>
      </div>
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}
      {!countRes.success && (
        <p role="alert" className="text-sm text-amber-600 dark:text-amber-400">
          Could not load recipient count: {countRes.error}
        </p>
      )}
      <NewsletterTable
        initialData={data}
        initialPage={page}
        totalPages={totalPages}
        count={count || 0}
        activeRecipientCount={activeRecipientCount}
        selectedStatuses={statuses}
      />
    </div>
  )
}
