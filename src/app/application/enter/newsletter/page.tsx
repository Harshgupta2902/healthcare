import Link from 'next/link'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getNewsletterSubscribers, getNewsletterActiveRecipientCount } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { NewsletterTable } from './NewsletterTable'
import type { SubscriberStatus } from './StatusFilter'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Newsletter Subscribers',
  description:
    'Newsletter Subscribers: manage subscriber status, resubscribes, and unsubscribes for HealthHere email updates.',
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
      <AdminPageHeader title="Newsletter Subscribers">
        <Button asChild variant="outline" className="liquid-glass gap-2 rounded-xl border-lp-outline-variant/40">
          <Link href="/application/enter/newsletter/campaigns">
            <Send className="h-4 w-4" />
            View campaigns
          </Link>
        </Button>
      </AdminPageHeader>
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
