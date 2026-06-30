'use client'

import { useState, useTransition } from 'react'
import { openAuthModal } from '@/features/auth/open-auth-modal'
import { Eye, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleBlogPostLike } from '@/features/blog/actions'
import { formatBlogCount } from '@/lib/blog/format'
import type { BlogEngagementUser } from '@/features/blog/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BlogViewCounter } from './BlogViewCounter'

type BlogPostEngagementBarProps = {
  postId: string
  slug: string
  initialLikeCount: number
  initialLiked: boolean
  initialViewCount: number
  engagementUser: BlogEngagementUser | null
  isPreview?: boolean
}

export function BlogPostEngagementBar({
  postId,
  slug,
  initialLikeCount,
  initialLiked,
  initialViewCount,
  engagementUser,
  isPreview,
}: BlogPostEngagementBarProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [viewCount, setViewCount] = useState(initialViewCount)
  const [isPending, startTransition] = useTransition()

  const loginRedirect = `/blog/${slug}`

  const handleLike = () => {
    if (!engagementUser) {
      toast.info('Sign in as a patient or consultant to like this article.')
      return
    }
    startTransition(async () => {
      const result = await toggleBlogPostLike({ postId })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setLiked(result.liked)
      setLikeCount(result.likeCount)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {!isPreview && <BlogViewCounter postId={postId} onViewCount={setViewCount} />}

      <span className="inline-flex items-center gap-1.5 text-sm text-lp-on-surface-variant">
        <Eye className="h-4 w-4 text-lp-brand" />
        <span className="font-medium text-lp-on-surface">{formatBlogCount(viewCount)}</span>
        <span>{viewCount === 1 ? 'view' : 'views'}</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-sm text-lp-on-surface-variant">
        <Heart className={cn('h-4 w-4', liked ? 'fill-red-500 text-red-500' : 'text-lp-brand')} />
        <span className="font-medium text-lp-on-surface">{formatBlogCount(likeCount)}</span>
        <span>{likeCount === 1 ? 'like' : 'likes'}</span>
      </span>

      {!isPreview &&
        (engagementUser ? (
          <Button
            type="button"
            variant={liked ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-xl gap-2',
              liked && 'border-red-500 bg-red-500 text-white hover:bg-red-600'
            )}
            disabled={isPending}
            onClick={handleLike}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
            {liked ? 'Liked' : 'Like'}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => openAuthModal({ view: 'login', redirect: loginRedirect })}
          >
            Sign in to like
          </Button>
        ))}
    </div>
  )
}
