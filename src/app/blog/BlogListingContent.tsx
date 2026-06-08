'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Clock, Eye, Heart, Sparkles, Tag } from 'lucide-react'
import { LpButton } from '@/components/ui/lp-button'
import type { BlogCategoryRow, BlogPostRow } from '@/features/blog/schema'
import { formatBlogCount, formatBlogDate, estimateReadMinutes } from '@/lib/blog/format'
import { cn } from '@/lib/utils'

type BlogListingContentProps = {
  posts: BlogPostRow[]
  categories: BlogCategoryRow[]
  activeCategorySlug?: string
  page: number
  totalPages: number
}

export function BlogListingContent({
  posts,
  categories,
  activeCategorySlug,
  page,
  totalPages,
}: BlogListingContentProps) {
  return (
    <div className="min-h-screen bg-lp-surface font-sans text-lp-on-surface selection:bg-lp-brand/15">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(0,89,187,0.06)_0%,rgba(248,249,255,0)_70%)] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-lp-outline-variant/30 bg-lp-surface-container-high px-4 py-1.5"
          >
            <Sparkles className="size-[18px] text-lp-brand" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-wider text-lp-on-surface-variant">
              HealthHere Blog
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mx-auto mb-4 max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Insights for better{' '}
            <span className="bg-gradient-to-r from-lp-brand to-lp-brand-bright bg-clip-text text-transparent">
              health & care
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-lp-on-surface-variant"
          >
            Expert articles on telehealth, wellness, and navigating your care journey with HealthHere.
          </motion.p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="border-b border-lp-outline-variant/20 pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-5 sm:px-8 lg:px-16">
            <CategoryChip href="/blog" label="All" active={!activeCategorySlug} />
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                label={cat.name}
                active={activeCategorySlug === cat.slug}
              />
            ))}
          </div>
        </section>
      )}

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-lp-outline-variant/40 py-20 text-center">
              <p className="text-lg text-lp-on-surface-variant">No articles yet. Check back soon.</p>
              <LpButton asChild variant="outline" className="mt-6 rounded-xl">
                <Link href="/">Back to home</Link>
              </LpButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {page > 1 && (
                <LpButton asChild variant="outline" className="rounded-xl">
                  <Link href={buildPageHref(page - 1, activeCategorySlug)}>Previous</Link>
                </LpButton>
              )}
              <span className="flex items-center px-4 text-sm text-lp-on-surface-variant">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <LpButton asChild variant="outline" className="rounded-xl">
                  <Link href={buildPageHref(page + 1, activeCategorySlug)}>Next</Link>
                </LpButton>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-medium transition-all',
        active
          ? 'bg-lp-brand text-lp-on-brand shadow-md shadow-lp-brand/20'
          : 'border border-lp-outline-variant/30 bg-lp-surface-container-lowest text-lp-on-surface-variant hover:border-lp-brand/30 hover:text-lp-brand'
      )}
    >
      {label}
    </Link>
  )
}

function BlogCard({ post, index }: { post: BlogPostRow; index: number }) {
  const readMin = estimateReadMinutes(post.excerpt ?? '')

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest transition-shadow duration-300 hover:shadow-xl"
    >
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-lp-surface-container-high">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={post.cover_image_url.startsWith('/uploads/')}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-lp-brand/10 to-lp-brand-bright/5">
            <Sparkles className="h-10 w-10 text-lp-brand/40" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        {post.category && (
          <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-lp-brand/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-lp-brand">
            <Tag className="h-3 w-3" />
            {post.category.name}
          </span>
        )}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="font-heading text-xl font-bold leading-snug text-lp-on-surface transition-colors group-hover:text-lp-brand">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-lp-on-surface-variant">{post.excerpt}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-lp-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatBlogDate(post.published_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readMin} min read
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatBlogCount(post.view_count)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {formatBlogCount(post.like_count)}
          </span>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-lp-brand hover:underline"
        >
          Read article
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.article>
  )
}

function buildPageHref(page: number, category?: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const q = params.toString()
  return q ? `/blog?${q}` : '/blog'
}
