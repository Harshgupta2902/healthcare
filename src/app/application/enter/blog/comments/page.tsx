import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import { getBlogCommentsAdmin } from '@/features/blog/admin-actions'
import { AdminPageHeader } from '../../_components/AdminPageHeader'
import { BlogSubNav } from '../_components/BlogSubNav'
import { BlogCommentsTable } from './BlogCommentsTable'

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog comments',
  description: 'Review and approve blog comments before they appear publicly.',
  pathname: '/application/enter/blog/comments',
  robots: ROBOTS_NOINDEX,
})

export default async function AdminBlogCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const search = params.search || ''
  const status = params.status || 'pending'

  const result = await getBlogCommentsAdmin(page, 15, status, search)
  const data = result.success ? result.data : []
  const count = result.success ? result.count : 0
  const totalPages = Math.ceil((count || 0) / 15)

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Blog comments" />

      <BlogSubNav />

      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {result.error}
        </p>
      )}

      <BlogCommentsTable
        initialData={data}
        initialPage={page}
        totalPages={totalPages}
        count={count}
        initialStatus={status}
      />
    </div>
  )
}
