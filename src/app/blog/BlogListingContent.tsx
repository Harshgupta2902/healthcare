import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import type { BlogCategoryRow, BlogPostRow } from '@/features/blog/schema'
import { formatBlogDate, estimateReadMinutes } from '@/lib/blog/format'
import { cn } from '@/lib/utils'

type BlogListingContentProps = {
  posts: BlogPostRow[]
  categories: BlogCategoryRow[]
  activeCategorySlug?: string
  page: number
  totalPages: number
}

const CLINICAL_SHADOW = 'shadow-[0px_4px_20px_rgba(10,25,47,0.05)]'

export function BlogListingContent({
  posts,
  categories,
  activeCategorySlug,
  page,
  totalPages,
}: BlogListingContentProps) {
  const showFeatured = page === 1 && !activeCategorySlug && posts.length > 0
  const featuredPost = showFeatured ? posts[0] : null
  const gridPosts = showFeatured ? posts.slice(1) : posts

  return (
    <div className="min-h-screen bg-lp-surface font-sans text-lp-on-surface selection:bg-lp-brand/15">
      <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-16 md:py-12">
        {featuredPost && <FeaturedHero post={featuredPost} />}

        {categories.length > 0 && (
          <section className="sticky top-20 z-40 -mx-5 mb-8 bg-lp-surface/90 px-5 py-4 backdrop-blur-sm md:mx-0 md:px-0">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
              <CategoryPill href="/blog" label="All Updates" active={!activeCategorySlug} />
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  label={cat.name}
                  active={activeCategorySlug === cat.slug}
                />
              ))}
            </div>
          </section>
        )}

        {posts.length === 0 ? (
          <div className={cn('rounded-xl border border-dashed border-lp-outline-variant/40 bg-lp-surface-container-lowest py-24 text-center', CLINICAL_SHADOW)}>
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-lp-brand/40" aria-hidden />
            <p className="font-heading text-xl font-semibold text-lp-on-surface">No articles yet</p>
            <p className="mt-2 text-lp-on-surface-variant">Check back soon for clinical insights and wellness updates.</p>
            <Link
              href="/"
              className={cn('mt-6 inline-flex rounded-lg bg-gradient-to-br from-lp-brand to-[#004493] px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90', CLINICAL_SHADOW)}
            >
              Back to home
            </Link>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </section>
        )}

        {totalPages > 1 && (
          <BlogPagination
            page={page}
            totalPages={totalPages}
            activeCategorySlug={activeCategorySlug}
          />
        )}
      </main>
    </div>
  )
}

function FeaturedHero({ post }: { post: BlogPostRow }) {
  const readMin = estimateReadMinutes(post.excerpt ?? post.title)
  const categoryLabel = post.category?.name ?? 'Featured'

  return (
    <section
      className={cn(
        'group relative mb-12 overflow-hidden rounded-xl md:mb-16',
        CLINICAL_SHADOW
      )}
    >
      <div className="relative aspect-[16/9] md:aspect-[21/9]">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            priority
            className="object-cover transition-transform duration-700"
            unoptimized={post.cover_image_url.startsWith('/uploads/')}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-lp-primary-container via-lp-brand/30 to-lp-brand-bright/20" />
        )}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[rgba(11,28,48,0.85)] via-[rgba(11,28,48,0.35)] to-transparent p-8 md:p-12">
          <div className="max-w-3xl">
            <span className="mb-4 inline-block rounded-full bg-lp-brand-bright px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {categoryLabel}
            </span>
            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl md:leading-[1.1]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
                {post.excerpt}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href={`/blog/${post.slug}`}
                className={cn('inline-flex rounded-lg bg-gradient-to-br from-lp-brand to-[#004493] px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90', CLINICAL_SHADOW)}
              >
                Read Full Article
              </Link>
              <span className="text-sm font-medium text-white/70">
                {readMin} min read &bull; {formatBlogDate(post.published_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoryPill({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-6 py-2 text-sm font-semibold uppercase tracking-wide transition-all',
        active
          ? 'border-lp-brand bg-lp-brand text-white shadow-sm'
          : 'border-lp-outline-variant/40 bg-white text-lp-on-surface hover:border-lp-brand'
      )}
    >
      {label}
    </Link>
  )
}

function BlogCard({ post }: { post: BlogPostRow }) {
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-xl border border-lp-outline-variant/30 bg-white transition-all duration-300 hover:-translate-y-1',
        CLINICAL_SHADOW
      )}
    >
      <Link href={`/blog/${post.slug}`} className="relative block aspect-video overflow-hidden bg-lp-surface-container-high">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={post.cover_image_url.startsWith('/uploads/')}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-lp-surface-container to-lp-surface-container-high">
            <Sparkles className="h-10 w-10 text-lp-brand/30" aria-hidden />
          </div>
        )}
        {post.category && (
          <div className="absolute left-4 top-4">
            <span className="rounded bg-lp-surface/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lp-brand backdrop-blur-sm">
              {post.category.name}
            </span>
          </div>
        )}
      </Link>

      <div className="p-6">
        <div className="mb-3 flex items-center gap-2 text-lp-on-surface-variant">
          <Calendar className="h-[18px] w-[18px] shrink-0 text-lp-brand" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-wide">
            {formatBlogDate(post.published_at)}
          </span>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-heading text-xl font-semibold leading-snug text-lp-on-surface transition-colors group-hover:text-lp-brand">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-base leading-relaxed text-lp-on-surface-variant">
            {post.excerpt}
          </p>
        )}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-lp-brand decoration-2 underline-offset-4 hover:underline"
        >
          Read Insight
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  )
}

function BlogPagination({
  page,
  totalPages,
  activeCategorySlug,
}: {
  page: number
  totalPages: number
  activeCategorySlug?: string
}) {
  const pages = buildPaginationPages(page, totalPages)

  return (
    <nav
      className="mt-16 flex items-center justify-center gap-2"
      aria-label="Blog pagination"
    >
      {page > 1 ? (
        <PaginationLink
          href={buildPageHref(page - 1, activeCategorySlug)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </PaginationLink>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-lp-outline-variant/30 opacity-40">
          <ChevronLeft className="h-5 w-5" />
        </span>
      )}

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-lp-on-surface-variant">
            …
          </span>
        ) : (
          <PaginationLink
            key={p}
            href={buildPageHref(p, activeCategorySlug)}
            active={p === page}
          >
            {p}
          </PaginationLink>
        )
      )}

      {page < totalPages ? (
        <PaginationLink
          href={buildPageHref(page + 1, activeCategorySlug)}
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </PaginationLink>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-lp-outline-variant/30 opacity-40">
          <ChevronRight className="h-5 w-5" />
        </span>
      )}
    </nav>
  )
}

function PaginationLink({
  href,
  children,
  active,
  ...props
}: {
  href: string
  children: React.ReactNode
  active?: boolean
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      href={href}
      className={cn(
        'flex h-10 min-w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors',
        active
          ? 'border-lp-brand bg-lp-brand text-white'
          : 'border-lp-outline-variant/40 text-lp-on-surface hover:bg-lp-surface-container'
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

function buildPaginationPages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

function buildPageHref(page: number, category?: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const q = params.toString()
  return q ? `/blog?${q}` : '/blog'
}
