'use client'

import { useState } from 'react'
import { Bookmark, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type BlogPostShareRowProps = {
  title: string
  tags: string[]
  className?: string
}

export function BlogPostShareRow({ title, tags, className }: BlogPostShareRowProps) {
  const [bookmarked, setBookmarked] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        /* user cancelled */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <div
      className={cn(
        'mt-12 flex flex-col gap-4 border-y border-lp-outline-variant/30 py-6 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-lp-on-surface-variant">Share:</span>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full p-2 text-lp-on-surface-variant transition-colors hover:bg-lp-surface-container"
          aria-label="Share article"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setBookmarked((b) => !b)}
          className={cn(
            'rounded-full p-2 transition-colors hover:bg-lp-surface-container',
            bookmarked ? 'text-lp-brand' : 'text-lp-on-surface-variant'
          )}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
        >
          <Bookmark className={cn('h-5 w-5', bookmarked && 'fill-current')} />
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-lp-surface-container px-3 py-1 text-sm text-lp-on-surface-variant"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
