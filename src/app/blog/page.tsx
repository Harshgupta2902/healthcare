import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import { getActiveBlogCategories, getPublishedBlogPosts } from '@/features/blog/actions'
import { BlogListingContent } from './BlogListingContent'

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog',
  description:
    'Health and care insights from HealthHere — telehealth tips, wellness guides, and expert articles for patients and consultants.',
  pathname: '/blog',
  keywords: ['HealthHere blog', 'health articles', 'telehealth tips', 'wellness'],
})

export const revalidate = 300

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const categorySlug = params.category

  const [postsResult, categories] = await Promise.all([
    getPublishedBlogPosts({ page, limit: 9, categorySlug }),
    getActiveBlogCategories(),
  ])

  const posts = postsResult.success ? postsResult.data : []
  const totalPages = postsResult.success ? postsResult.totalPages : 0

  return (
    <BlogListingContent
      posts={posts}
      categories={categories}
      activeCategorySlug={categorySlug}
      page={page}
      totalPages={totalPages}
    />
  )
}
