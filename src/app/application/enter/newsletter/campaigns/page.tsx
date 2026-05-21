import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getNewsletterCampaigns } from '@/features/admin/actions'
import { AdminPageHeader } from '../../_components/AdminPageHeader'
import { CampaignsTable } from './CampaignsTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Newsletter Campaigns',
  description:
    'Newsletter Campaigns: review past and active campaigns sent through the HealthHere newsletter system.',
  pathname: '/application/enter/newsletter/campaigns',
  robots: ROBOTS_NOINDEX,
})

export default async function NewsletterCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const result = await getNewsletterCampaigns(page, 10, search)
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.ceil((count || 0) / 10)

  return (
    <div className="space-y-6">
      <Link
        href="/application/enter/newsletter"
        className="inline-flex items-center gap-1 text-sm text-lp-brand hover:text-lp-brand-bright hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to subscribers
      </Link>
      <AdminPageHeader
        title="Newsletter Campaigns"
        description="Every newsletter you've sent — view the HTML body and which subscribers received it."
      />
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}
      <CampaignsTable
        initialData={data}
        initialPage={page}
        totalPages={totalPages}
        count={count || 0}
      />
    </div>
  )
}
