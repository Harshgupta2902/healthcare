import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, BadgeCheck, Calendar, Clock, Sparkles, Tag } from 'lucide-react'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'
import {
  getBlogComments,
  getBlogPostBySlug,
  getCurrentUserLike,
  getRelatedBlogPosts,
} from '@/features/blog/actions'
import { getBlogSessionUser } from '@/features/blog/auth'
import { formatBlogDate, estimateReadMinutes } from '@/lib/blog/format'
import { BlogArticleBody } from './BlogArticleBody'
import { BlogPostInteractive } from './BlogPostInteractive'
import { LpButton } from '@/components/ui/lp-button'

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

  const [commentsResult, liked, engagementUser, related] = await Promise.all([
    getBlogComments(post.id),
    isPreview ? Promise.resolve(false) : getCurrentUserLike(post.id),
    isPreview ? Promise.resolve(null) : getBlogSessionUser(),
    getRelatedBlogPosts(post.id, post.category_id),
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

      <article className="pb-16 md:pb-24">
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(0,89,187,0.08)_0%,transparent_55%)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 md:py-16 lg:px-16">
            <LpButton asChild variant="ghost" size="sm" className="mb-8 -ml-2 rounded-xl gap-2 text-lp-on-surface-variant">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4" />
                All articles
              </Link>
            </LpButton>

            {post.category && (
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-lp-brand/20 bg-lp-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lp-brand transition-colors hover:bg-lp-brand/15"
              >
                <Tag className="h-3 w-3" />
                {post.category.name}
              </Link>
            )}

            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-lg leading-relaxed text-lp-on-surface-variant">{post.excerpt}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-lp-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-lp-brand" />
                {formatBlogDate(post.published_at)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-lp-brand" />
                {readMin} min read
              </span>
              {post.author?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-lp-brand" />
                  {post.author.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {post.cover_image_url && (
          <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-16">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-lp-outline-variant/30 shadow-lg">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized={post.cover_image_url.startsWith('/uploads/')}
              />
            </div>
          </div>
        )}

        <div className="mx-auto mt-10 max-w-3xl px-5 sm:px-8 lg:px-16">
          <BlogArticleBody html={post.content_html} />

          <div className="mt-12 border-t border-lp-outline-variant/25 pt-10">
            <BlogPostInteractive
              postId={post.id}
              slug={post.slug}
              initialLikeCount={post.like_count}
              initialLiked={liked}
              initialViewCount={post.view_count}
              initialCommentCount={post.comment_count}
              initialComments={comments}
              initialCommentsTotal={commentsTotal}
              engagementUser={engagementUser}
              isPreview={isPreview}
            />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-lp-outline-variant/20 bg-lp-surface-container-high/40 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
            <h2 className="mb-8 font-heading text-2xl font-bold">Related articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group rounded-2xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-5 transition-shadow hover:shadow-lg"
                >
                  {r.category && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-lp-brand">{r.category.name}</span>
                  )}
                  <h3 className="mt-2 font-heading text-lg font-bold group-hover:text-lp-brand">{r.title}</h3>
                  {r.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-lp-on-surface-variant">{r.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
