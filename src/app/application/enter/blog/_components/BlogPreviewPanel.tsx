'use client'

import { sanitizeBlogHtml } from '@/lib/blog/sanitize-html'
import type { BlogCategoryRow } from '@/features/blog/schema'
import { Calendar, Eye, Tag } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type BlogPreviewPanelProps = {
  title: string
  excerpt: string
  coverImageUrl: string | null
  contentHtml: string
  category: BlogCategoryRow | null
  className?: string
}

function formatPreviewDate() {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())
}

export function BlogPreviewPanel({
  title,
  excerpt,
  coverImageUrl,
  contentHtml,
  category,
  className,
}: BlogPreviewPanelProps) {
  const safeHtml = sanitizeBlogHtml(contentHtml)
  const hasContent = safeHtml.replace(/<[^>]+>/g, '').trim().length > 0

  return (
    <div
      className={cn(
        'overflow-auto rounded-2xl border border-lp-outline-variant/40 bg-lp-surface-container-lowest shadow-inner',
        className
      )}
    >
      <div className="border-b border-lp-outline-variant/25 bg-lp-surface-container-high/60 px-4 py-2">
        <p className="flex items-center gap-2 text-xs font-medium text-lp-on-surface-variant">
          <Eye className="h-3.5 w-3.5 text-lp-brand" />
          Live preview — how readers will see this article
        </p>
      </div>

      <article className="p-5 sm:p-6">
        {category && (
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-lp-brand/20 bg-lp-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lp-brand">
            <Tag className="h-3 w-3" />
            {category.name}
          </span>
        )}

        <h1 className="font-heading text-2xl font-bold leading-tight text-lp-on-surface sm:text-3xl">
          {title.trim() || 'Untitled article'}
        </h1>

        {excerpt.trim() && (
          <p className="mt-3 text-base leading-relaxed text-lp-on-surface-variant">{excerpt}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-lp-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-lp-brand" />
            {formatPreviewDate()}
          </span>
          <span className="text-lp-outline-variant">·</span>
          <span>HealthHere Team</span>
        </div>

        {coverImageUrl && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl border border-lp-outline-variant/30">
            <Image
              src={coverImageUrl}
              alt={title || 'Cover preview'}
              fill
              className="object-cover"
              unoptimized={coverImageUrl.startsWith('/uploads/')}
            />
          </div>
        )}

        <div className="mt-6 border-t border-lp-outline-variant/20 pt-6">
          {hasContent ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-heading prose-headings:text-lp-on-surface prose-p:text-lp-on-surface-variant prose-a:text-lp-brand"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          ) : (
            <p className="py-12 text-center text-sm italic text-lp-on-surface-variant">
              Start writing in the editor — your article preview will appear here.
            </p>
          )}
        </div>
      </article>
    </div>
  )
}
