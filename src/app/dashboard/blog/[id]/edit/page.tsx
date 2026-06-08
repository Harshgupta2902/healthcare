import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import { getActiveBlogCategories } from '@/features/blog/actions'
import { getMyBlogPostById } from '@/features/blog/author-actions'
import { Button } from '@/components/ui/button'
import { BlogPostEditor } from '@/app/application/enter/blog/_components/BlogPostEditor'
import { requireDashboardBlogAuthor } from '../../_components/require-blog-author'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const result = await getMyBlogPostById(id)
  return buildPageMetadata({
    title: result.success && result.data ? `Edit: ${result.data.title}` : 'Edit article',
    description: 'Edit your HealthHere blog article.',
    pathname: `/dashboard/blog/${id}/edit`,
    robots: ROBOTS_NOINDEX,
  })
}

export default async function EditDashboardBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireDashboardBlogAuthor()
  const { id } = await params

  const [postResult, categories] = await Promise.all([getMyBlogPostById(id), getActiveBlogCategories()])

  if (!postResult.success || !postResult.data) notFound()

  return (
    <div className="relative min-h-screen bg-lp-surface">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 rounded-xl gap-2 text-lp-on-surface-variant">
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4" />
            My articles
          </Link>
        </Button>

        <BlogPostEditor categories={categories} post={postResult.data} mode="author" />
      </div>
    </div>
  )
}
