import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import { getBlogCategoriesAdmin, getBlogPostByIdAdmin } from '@/features/blog/admin-actions'
import { AdminPageHeader } from '../../../_components/AdminPageHeader'
import { BlogSubNav } from '../../_components/BlogSubNav'
import { BlogPostEditor } from '../../_components/BlogPostEditor'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const result = await getBlogPostByIdAdmin(id)
  return buildPageMetadata({
    title: result.success && result.data ? `Edit: ${result.data.title}` : 'Edit article',
    description: 'Edit a HealthHere blog article.',
    pathname: `/application/enter/blog/${id}/edit`,
    robots: ROBOTS_NOINDEX,
  })
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [postResult, categoriesResult] = await Promise.all([
    getBlogPostByIdAdmin(id),
    getBlogCategoriesAdmin(false),
  ])

  if (!postResult.success || !postResult.data) notFound()

  const categories = categoriesResult.success ? categoriesResult.data.filter((c) => c.is_active) : []

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit article" />
      <BlogSubNav />
      <BlogPostEditor categories={categories} post={postResult.data} />
    </div>
  )
}
