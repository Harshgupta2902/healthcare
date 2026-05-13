import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getNewsletterCampaigns } from '@/features/admin/actions'
import { CampaignsTable } from './CampaignsTable'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Newsletter campaigns',
  description: 'Admin: review newsletter campaigns and performance.',
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/application/enter/newsletter"
            className="inline-flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to subscribers
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Newsletter Campaigns
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Every newsletter you've sent — view the HTML body and which subscribers received it.
          </p>
        </div>
      </div>
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
