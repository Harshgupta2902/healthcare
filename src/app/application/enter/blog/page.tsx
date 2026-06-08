import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import { getBlogCategoriesAdmin, getBlogPostsAdmin } from '@/features/blog/admin-actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { BlogSubNav } from './_components/BlogSubNav'
import { BlogPostsTable } from './BlogPostsTable'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog',
  description: 'Manage HealthHere blog articles, categories, and publishing.',
  pathname: '/application/enter/blog',
  robots: ROBOTS_NOINDEX,
})

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; category?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const search = params.search || ''
  const status = params.status || 'all'
  const categoryId = params.category || 'all'

  const [postsResult, categoriesResult] = await Promise.all([
    getBlogPostsAdmin(page, 10, search, status, categoryId),
    getBlogCategoriesAdmin(true),
  ])

  const data = postsResult.success ? postsResult.data : []
  const count = postsResult.success ? postsResult.count : 0
  const totalPages = Math.ceil((count || 0) / 10)
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Blog">
        <Button asChild className="rounded-xl gap-2 bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand">
          <Link href="/application/enter/blog/new">
            <Plus className="h-4 w-4" />
            New article
          </Link>
        </Button>
      </AdminPageHeader>

      <BlogSubNav />

      {!postsResult.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {postsResult.error}
        </p>
      )}

      <BlogPostsTable
        initialData={data}
        initialPage={page}
        totalPages={totalPages}
        count={count}
        categories={categories}
        initialStatus={status}
        initialCategoryId={categoryId}
      />
    </div>
  )
}
