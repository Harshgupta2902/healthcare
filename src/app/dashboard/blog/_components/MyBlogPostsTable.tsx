'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteAuthorBlogPost } from '@/features/blog/author-actions'
import type { BlogPostRow } from '@/features/blog/schema'
import { DeleteDialog } from '@/app/application/enter/_components/DeleteDialog'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    pending_review: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  }
  const label =
    status === 'pending_review' ? 'Pending review' : status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <Badge variant="secondary" className={map[status] ?? ''}>
      {label}
    </Badge>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(iso)
  )
}

type MyBlogPostsTableProps = {
  posts: BlogPostRow[]
}

export function MyBlogPostsTable({ posts }: MyBlogPostsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<BlogPostRow | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteAuthorBlogPost(deleteTarget.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Article deleted')
      setDeleteTarget(null)
      router.refresh()
    })
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-lp-outline-variant/40 bg-lp-surface-container-lowest px-6 py-16 text-center">
        <p className="font-heading text-lg font-semibold text-lp-on-surface">No articles yet</p>
        <p className="mt-2 text-sm text-lp-on-surface-variant">
          Share your health insights. Articles go live after admin approval.
        </p>
        <Button asChild className="mt-6 rounded-xl bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand">
          <Link href="/dashboard/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            Write your first article
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-lp-outline-variant/30 bg-lp-surface-container-high/60">
              <tr>
                <th className="px-4 py-3 font-semibold text-lp-on-surface">Title</th>
                <th className="px-4 py-3 font-semibold text-lp-on-surface">Status</th>
                <th className="px-4 py-3 font-semibold text-lp-on-surface">Submitted</th>
                <th className="px-4 py-3 font-semibold text-lp-on-surface">Published</th>
                <th className="px-4 py-3 font-semibold text-lp-on-surface">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-lp-outline-variant/20 last:border-0">
                  <td className="px-4 py-4">
                    <p className="font-medium text-lp-on-surface">{post.title}</p>
                    <p className="font-mono text-xs text-lp-on-surface-variant">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-4">{statusBadge(post.status)}</td>
                  <td className="px-4 py-4 text-lp-on-surface-variant">{formatDate(post.submitted_at)}</td>
                  <td className="px-4 py-4 text-lp-on-surface-variant">{formatDate(post.published_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {['draft', 'pending_review'].includes(post.status) && (
                        <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg">
                          <Link href={`/dashboard/blog/${post.id}/edit`}>Edit</Link>
                        </Button>
                      )}
                      {post.status === 'published' && (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {['draft', 'pending_review'].includes(post.status) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-red-600"
                          onClick={() => setDeleteTarget(post)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete article"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        isPending={isPending}
      />
    </>
  )
}
