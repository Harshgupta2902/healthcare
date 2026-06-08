import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import { getBlogCategoriesAdmin } from '@/features/blog/admin-actions'
import { AdminPageHeader } from '../../_components/AdminPageHeader'
import { BlogSubNav } from '../_components/BlogSubNav'
import { BlogPostEditor } from '../_components/BlogPostEditor'

export const metadata: Metadata = buildPageMetadata({
  title: 'New Blog Article',
  description: 'Create a new HealthHere blog article.',
  pathname: '/application/enter/blog/new',
  robots: ROBOTS_NOINDEX,
})

export default async function NewBlogPostPage() {
  const categoriesResult = await getBlogCategoriesAdmin(false)
  const categories = categoriesResult.success ? categoriesResult.data.filter((c) => c.is_active) : []

  return (
    <div className="space-y-6">
      <AdminPageHeader title="New article" />
      <BlogSubNav />
      {categories.length === 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Create at least one active category before publishing. Drafts can be saved without a category.
        </p>
      )}
      <BlogPostEditor categories={categories} />
    </div>
  )
}
