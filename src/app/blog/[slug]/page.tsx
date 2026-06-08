import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import {
  getBlogComments,
  getBlogPostBySlug,
  getCurrentUserLike,
  getRecommendedBlogPosts,
} from '@/features/blog/actions'
import { getBlogSessionUser } from '@/features/blog/auth'
import { formatBlogDate, estimateReadMinutes } from '@/lib/blog/format'
import { BlogArticleBody } from './BlogArticleBody'
import { BlogPostInteractive } from './BlogPostInteractive'
import { BlogPostEngagementBar } from './BlogPostEngagementBar'
import { BlogPostSidebar } from './BlogPostSidebar'
import { BlogPostShareRow } from './BlogPostShareRow'
import { LpButton } from '@/components/ui/lp-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { preview } = await searchParams
  const isPreview = preview === '1'
  const result = await getBlogPostBySlug(slug, isPreview)
  if (!result.success || !result.data) {
    return buildPageMetadata({ title: 'Article not found', pathname: `/blog/${slug}`, robots: ROBOTS_NOINDEX })
  }
  const post = result.data
  return buildPageMetadata({
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    pathname: `/blog/${slug}`,
    openGraphType: 'article',
    ogImage: post.cover_image_url,
    robots: isPreview ? ROBOTS_NOINDEX : undefined,
  })
}

export const revalidate = 300

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { preview } = await searchParams
  const isPreview = preview === '1'

  const result = await getBlogPostBySlug(slug, isPreview)
  if (!result.success || !result.data) notFound()

  const post = result.data

  const [commentsResult, liked, engagementUser, recommended] = await Promise.all([
    getBlogComments(post.id),
    isPreview ? Promise.resolve(false) : getCurrentUserLike(post.id),
    isPreview ? Promise.resolve(null) : getBlogSessionUser(),
    getRecommendedBlogPosts(post.id, 5),
  ])

  const comments = commentsResult.success ? commentsResult.data : []
  const commentsTotal = commentsResult.success ? commentsResult.count : post.comment_count
  const readMin = estimateReadMinutes(post.content_html)

  return (
    <div className="min-h-screen bg-lp-surface font-sans text-lp-on-surface selection:bg-lp-brand/15">
      {isPreview && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Draft preview — this article is not public yet
        </div>
      )}

      <main className="pb-16 md:pb-24">
        {/* Article header */}
        <section className="mx-auto mb-8 max-w-[1280px] px-5 md:px-16">
          <div className="flex flex-col gap-4">
            

            <h1 className="font-heading pt-12 text-3xl font-bold leading-tight tracking-tight text-lp-on-surface sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg leading-relaxed text-lp-on-surface-variant">{post.excerpt}</p>
            )}

            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-lp-outline-variant/30">
                  <AvatarImage src={post.author?.image ?? undefined} alt={post.author?.name ?? 'Author'} />
                  <AvatarFallback className="bg-lp-surface-container-high text-lp-on-surface">
                    {(post.author?.name ?? 'A').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  {post.author?.name && (
                    <span className="text-sm font-semibold text-lp-on-surface">{post.author.name}</span>
                  )}
                  <span className="text-sm text-lp-on-surface-variant">
                    {formatBlogDate(post.published_at)}
                    {readMin > 0 && ` · ${readMin} min read`}
                  </span>
                </div>
              </div>

              <BlogPostEngagementBar
                postId={post.id}
                slug={post.slug}
                initialLikeCount={post.like_count}
                initialLiked={liked}
                initialViewCount={post.view_count}
                engagementUser={engagementUser}
                isPreview={isPreview}
              />
            </div>
          </div>
        </section>

        {/* Hero image */}
        {post.cover_image_url && (
          <section className="mx-auto mb-12 max-w-[1280px] px-5 md:px-16">
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl shadow-sm">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized={post.cover_image_url.startsWith('/uploads/')}
              />
            </div>
          </section>
        )}

        {/* Main content + sidebar */}
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 md:px-16 lg:flex-row lg:gap-6">
          <article className="w-full lg:w-2/3">
            <BlogArticleBody html={post.content_html} />

            <BlogPostShareRow title={post.title} tags={post.tags ?? []} />
          </article>

          <BlogPostSidebar recommended={recommended} />
        </div>

        {/* Comments at the end */}
        {!isPreview && (
          <div className="mx-auto mt-12 max-w-[1280px] px-5 md:px-16">
            <BlogPostInteractive
              postId={post.id}
              slug={post.slug}
              initialComments={comments}
              initialCommentsTotal={commentsTotal}
              engagementUser={engagementUser}
              isPreview={isPreview}
            />
          </div>
        )}
      </main>
    </div>
  )
}
