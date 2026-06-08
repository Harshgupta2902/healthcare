import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import { getActiveBlogCategories } from '@/features/blog/actions'
import { Button } from '@/components/ui/button'
import { BlogPostEditor } from '@/app/application/enter/blog/_components/BlogPostEditor'
import { requireDashboardBlogAuthor } from '../_components/require-blog-author'

export const metadata: Metadata = buildPageMetadata({
  title: 'New article',
  description: 'Write a new HealthHere blog article.',
  pathname: '/dashboard/blog/new',
  robots: ROBOTS_NOINDEX,
})

export default async function NewDashboardBlogPostPage() {
  await requireDashboardBlogAuthor()
  const categories = await getActiveBlogCategories()

  return (
    <div className="relative min-h-screen bg-lp-surface">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 rounded-xl gap-2 text-lp-on-surface-variant">
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4" />
            My articles
          </Link>
        </Button>

        {categories.length === 0 && (
          <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            No categories are available yet. You can save a draft, but you will need a category before submitting for review.
          </p>
        )}

        <BlogPostEditor categories={categories} mode="author" />
      </div>
    </div>
  )
}
