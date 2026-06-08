import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import { getBlogCategoriesAdmin } from '@/features/blog/admin-actions'
import { AdminPageHeader } from '../../_components/AdminPageHeader'
import { BlogSubNav } from '../_components/BlogSubNav'
import { CategoriesTable } from './CategoriesTable'

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog Categories',
  description: 'Manage blog categories for HealthHere articles.',
  pathname: '/application/enter/blog/categories',
  robots: ROBOTS_NOINDEX,
})

export default async function BlogCategoriesPage() {
  const result = await getBlogCategoriesAdmin(true)
  const data = result.success ? result.data : []

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Blog categories" />
      <BlogSubNav />
      {!result.success && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {result.error}
        </p>
      )}
      <CategoriesTable initialData={data} />
    </div>
  )
}
