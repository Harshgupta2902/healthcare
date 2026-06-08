import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Plus } from 'lucide-react'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import { getMyBlogPosts } from '@/features/blog/author-actions'
import { Button } from '@/components/ui/button'
import { requireDashboardBlogAuthor } from './_components/require-blog-author'
import { MyBlogPostsTable } from './_components/MyBlogPostsTable'

export const metadata: Metadata = buildPageMetadata({
  title: 'My articles',
  description: 'Write and manage your HealthHere blog articles.',
  pathname: '/dashboard/blog',
  robots: ROBOTS_NOINDEX,
})

export default async function DashboardBlogPage() {
  await requireDashboardBlogAuthor()
  const result = await getMyBlogPosts(1, 50)
  const posts = result.success ? result.data : []

  return (
    <div className="relative min-h-screen bg-lp-surface">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 rounded-xl gap-2 text-lp-on-surface-variant">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
            <h1 className="font-heading text-3xl font-bold text-lp-on-surface">My articles</h1>
            <p className="mt-2 text-lp-on-surface-variant">
              Write health insights as a draft, then submit for admin review. Published date is set when approved.
            </p>
          </div>
          <Button asChild className="rounded-xl gap-2 bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand">
            <Link href="/dashboard/blog/new">
              <Plus className="h-4 w-4" />
              New article
            </Link>
          </Button>
        </div>

        {!result.success && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {result.error}
          </p>
        )}

        <MyBlogPostsTable posts={posts} />
      </div>
    </div>
  )
}
