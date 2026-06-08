'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Loader2, Trash2, BadgeCheck, Reply, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  createBlogComment,
  deleteOwnBlogComment,
  getBlogComments,
} from '@/features/blog/actions'
import { buildCommentTree } from '@/lib/blog/comment-tree'
import type { BlogCommentNode, BlogCommentRow } from '@/features/blog/schema'
import type { BlogEngagementUser } from '@/features/blog/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
const COMMENTS_PAGE_SIZE = 20

type BlogPostInteractiveProps = {
  postId: string
  slug: string
  initialComments: BlogCommentRow[]
  initialCommentsTotal: number
  engagementUser: BlogEngagementUser | null
  isPreview?: boolean
}

function roleLabel(role: string) {
  return role === 'professional' ? 'Consultant' : 'Patient'
}

function formatCommentDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function BlogPostInteractive({
  postId,
  slug,
  initialComments,
  initialCommentsTotal,
  engagementUser,
  isPreview,
}: BlogPostInteractiveProps) {
  const [comments, setComments] = useState(initialComments)
  const [commentsPage, setCommentsPage] = useState(1)
  const [commentsTotal, setCommentsTotal] = useState(initialCommentsTotal)
  const [topLevelBody, setTopLevelBody] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [isPending, startTransition] = useTransition()

  const loginRedirect = `/blog/${slug}`
  const commentTree = useMemo(() => buildCommentTree(comments), [comments])
  const hasMoreComments = comments.length < commentsTotal

  const submitComment = (body: string, parentId?: string | null) => {
    if (!engagementUser) return
    const trimmed = body.trim()
    if (!trimmed) {
      toast.error('Write a comment first.')
      return
    }

    startTransition(async () => {
      const result = await createBlogComment({
        postId,
        body: trimmed,
        parentId: parentId ?? null,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setComments((prev) => [...prev, result.comment])
      setCommentsTotal((t) => t + 1)
      if (parentId) {
        setReplyingToId(null)
        setReplyBody('')
      } else {
        setTopLevelBody('')
      }
      toast.success(parentId ? 'Reply posted' : 'Comment posted')
    })
  }

  const handleLoadMore = () => {
    startTransition(async () => {
      const nextPage = commentsPage + 1
      const result = await getBlogComments(postId, nextPage, COMMENTS_PAGE_SIZE)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setComments((prev) => {
        const seen = new Set(prev.map((c) => c.id))
        const merged = [...prev]
        for (const row of result.data) {
          if (!seen.has(row.id)) merged.push(row)
        }
        return merged
      })
      setCommentsPage(nextPage)
      setCommentsTotal(result.count)
    })
  }

  const handleDeleteComment = (commentId: string) => {
    startTransition(async () => {
      const result = await deleteOwnBlogComment(commentId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const removeIds = new Set<string>([commentId])
      const collectReplies = (id: string) => {
        comments.forEach((c) => {
          if (c.parent_id === id) {
            removeIds.add(c.id)
            collectReplies(c.id)
          }
        })
      }
      collectReplies(commentId)
      setComments((prev) => prev.filter((c) => !removeIds.has(c.id)))
      setCommentsTotal((t) => Math.max(0, t - removeIds.size))
      toast.success('Comment removed')
    })
  }

  if (isPreview) return null

  return (
    <section className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-lp-on-surface">
        Comments {commentsTotal > 0 && <span className="text-lp-on-surface-variant">({commentsTotal})</span>}
      </h2>

      {engagementUser ? (
        <div className="rounded-2xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-5">
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={engagementUser.image ?? undefined} />
              <AvatarFallback>{engagementUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-lp-on-surface">{engagementUser.name}</p>
              <p className="text-xs text-lp-on-surface-variant">{roleLabel(engagementUser.role)}</p>
            </div>
          </div>
          <Textarea
            value={topLevelBody}
            onChange={(e) => setTopLevelBody(e.target.value)}
            placeholder="Share your thoughts on this article…"
            className="min-h-[100px] resize-none rounded-xl"
            maxLength={2000}
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                submitComment(topLevelBody)
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-lp-on-surface-variant">Ctrl+Enter to post · You can add multiple comments</p>
            <Button
              type="button"
              className="rounded-xl bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand"
              disabled={isPending || !topLevelBody.trim()}
              onClick={() => submitComment(topLevelBody)}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-lp-outline-variant/40 bg-lp-surface-container-high/50 p-8 text-center">
          <p className="text-lp-on-surface-variant">
            Sign in as a patient or consultant to join the conversation.
          </p>
          <Button asChild className="mt-4 rounded-xl" variant="outline">
            <Link href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}>Sign in</Link>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {commentTree.length === 0 ? (
          <p className="py-6 text-center text-sm text-lp-on-surface-variant italic">
            No comments yet — be the first to share your perspective.
          </p>
        ) : (
          commentTree.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              depth={0}
              engagementUser={engagementUser}
              isPending={isPending}
              replyingToId={replyingToId}
              replyBody={replyBody}
              onReplyOpen={(id) => {
                setReplyingToId(id)
                setReplyBody('')
              }}
              onReplyCancel={() => {
                setReplyingToId(null)
                setReplyBody('')
              }}
              onReplyBodyChange={setReplyBody}
              onSubmitReply={(parentId, body) => submitComment(body, parentId)}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>

      {hasMoreComments && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl gap-2"
            disabled={isPending}
            onClick={handleLoadMore}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Load more comments ({comments.length} of {commentsTotal})
          </Button>
        </div>
      )}
    </section>
  )
}

type CommentThreadProps = {
  comment: BlogCommentNode
  depth: number
  engagementUser: BlogEngagementUser | null
  isPending: boolean
  replyingToId: string | null
  replyBody: string
  onReplyOpen: (id: string) => void
  onReplyCancel: () => void
  onReplyBodyChange: (value: string) => void
  onSubmitReply: (parentId: string, body: string) => void
  onDelete: (id: string) => void
}

function CommentThread({
  comment,
  depth,
  engagementUser,
  isPending,
  replyingToId,
  replyBody,
  onReplyOpen,
  onReplyCancel,
  onReplyBodyChange,
  onSubmitReply,
  onDelete,
}: CommentThreadProps) {
  const isReplying = replyingToId === comment.id

  return (
    <div className={cn(depth > 0 && 'ml-4 border-l-2 border-lp-brand/15 pl-4 sm:ml-8')}>
      <article className="flex gap-3 rounded-2xl border border-lp-outline-variant/25 bg-lp-surface-container-lowest p-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={comment.user?.image ?? undefined} />
          <AvatarFallback>{(comment.user?.name ?? 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-lp-on-surface">{comment.user?.name ?? 'User'}</span>
            <Badge variant="secondary" className="gap-1 text-[10px] uppercase tracking-wide">
              {comment.user?.role === 'professional' && <BadgeCheck className="h-3 w-3" />}
              {roleLabel(comment.user?.role ?? 'client')}
            </Badge>
            <span className="text-xs text-lp-on-surface-variant">{formatCommentDate(comment.created_at)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-lp-on-surface-variant">
            {comment.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {engagementUser && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg gap-1 text-lp-brand"
                disabled={isPending}
                onClick={() => (isReplying ? onReplyCancel() : onReplyOpen(comment.id))}
              >
                <Reply className="h-3.5 w-3.5" />
                {isReplying ? 'Cancel' : 'Reply'}
              </Button>
            )}
            {engagementUser?.id === comment.user_id && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg gap-1 text-red-600 hover:text-red-700"
                disabled={isPending}
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>

          {isReplying && engagementUser && (
            <div className="mt-3 space-y-2 rounded-xl border border-lp-outline-variant/25 bg-lp-surface-container-high/40 p-3">
              <Textarea
                value={replyBody}
                onChange={(e) => onReplyBodyChange(e.target.value)}
                placeholder={`Reply to ${comment.user?.name ?? 'this comment'}…`}
                className="min-h-[80px] resize-none rounded-xl text-sm"
                maxLength={2000}
                disabled={isPending}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    onSubmitReply(comment.id, replyBody)
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={onReplyCancel}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-lg bg-lp-brand text-lp-on-brand"
                  disabled={isPending || !replyBody.trim()}
                  onClick={() => onSubmitReply(comment.id, replyBody)}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post reply'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </article>

      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              engagementUser={engagementUser}
              isPending={isPending}
              replyingToId={replyingToId}
              replyBody={replyBody}
              onReplyOpen={onReplyOpen}
              onReplyCancel={onReplyCancel}
              onReplyBodyChange={onReplyBodyChange}
              onSubmitReply={onSubmitReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
