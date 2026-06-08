'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTransition } from 'react'
import { Check, ExternalLink, Eye, Heart, MessageSquare, X } from 'lucide-react'
import { DataTable } from '../_components/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { approveBlogPost, deleteBlogPost, rejectBlogPost } from '@/features/blog/admin-actions'
import type { BlogCategoryRow, BlogPostRow } from '@/features/blog/schema'
import { toast } from 'sonner'
import { DeleteDialog } from '../_components/DeleteDialog'
import { useState } from 'react'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    pending_review: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  }
  return (
    <Badge variant="secondary" className={map[status] ?? ''}>
      {status}
    </Badge>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}

type BlogPostsTableProps = {
  initialData: BlogPostRow[]
  initialPage: number
  totalPages: number
  count: number
  categories: BlogCategoryRow[]
  initialStatus?: string
  initialCategoryId?: string
}

export function BlogPostsTable({
  initialData,
  initialPage,
  totalPages,
  count,
  categories,
  initialStatus = 'all',
  initialCategoryId = 'all',
}: BlogPostsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<BlogPostRow | null>(null)

  const pushFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === 'all') params.delete(k)
      else params.set(k, v)
    })
    params.delete('page')
    router.push(`/application/enter/blog?${params.toString()}`)
  }

  const handleApprove = (item: BlogPostRow) => {
    startTransition(async () => {
      const result = await approveBlogPost(item.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Article approved and published')
      router.refresh()
    })
  }

  const handleReject = (item: BlogPostRow) => {
    startTransition(async () => {
      const result = await rejectBlogPost(item.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Article sent back to draft')
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteBlogPost(deleteTarget.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Article deleted')
      setDeleteTarget(null)
      router.refresh()
    })
  }

  return (
    <>
      <DataTable
        data={initialData}
        columns={[
          {
            key: 'title',
            label: 'Title',
            render: (item) => (
              <div className="min-w-[180px] max-w-xs">
                <p className="truncate font-medium text-lp-on-surface">{item.title}</p>
                <p className="truncate font-mono text-xs text-lp-on-surface-variant">/blog/{item.slug}</p>
              </div>
            ),
          },
          {
            key: 'author',
            label: 'Author',
            render: (item) => (
              <span className="text-sm text-lp-on-surface-variant">{item.author?.name ?? '—'}</span>
            ),
          },
          {
            key: 'category',
            label: 'Category',
            render: (item) => (
              <span className="text-sm text-lp-on-surface-variant">{item.category?.name ?? '—'}</span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => statusBadge(item.status),
          },
          {
            key: 'published_at',
            label: 'Published',
            render: (item) => (
              <span className="text-sm text-lp-on-surface-variant">{formatDate(item.published_at)}</span>
            ),
          },
          {
            key: 'engagement',
            label: 'Engagement',
            render: (item) => (
              <div className="flex flex-wrap items-center gap-2 text-xs text-lp-on-surface-variant">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {item.view_count}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {item.like_count}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {item.comment_count}
                </span>
              </div>
            ),
          },
        ]}
        searchPlaceholder="Search by title or slug…"
        onSearch={(q) => pushFilters({ search: q || undefined })}
        searchExtra={
          <div className="flex flex-wrap gap-2">
            <Select value={initialStatus} onValueChange={(v) => pushFilters({ status: v })}>
              <SelectTrigger className="h-9 w-[130px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Pending review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={initialCategoryId} onValueChange={(v) => pushFilters({ category: v })}>
              <SelectTrigger className="h-9 w-[150px] rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        onAdd={() => router.push('/application/enter/blog/new')}
        addLabel="New article"
        onEdit={(item) => router.push(`/application/enter/blog/${item.id}/edit`)}
        onDelete={(item) => setDeleteTarget(item)}
        renderRowActions={(item) => (
          <div className="flex items-center gap-1">
            {item.status === 'pending_review' && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700"
                  disabled={isPending}
                  onClick={() => handleApprove(item)}
                  aria-label="Approve and publish"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-red-600 hover:text-red-700"
                  disabled={isPending}
                  onClick={() => handleReject(item)}
                  aria-label="Reject and return to draft"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {item.status === 'published' && (
              <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <Link href={`/blog/${item.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
        page={initialPage}
        totalPages={totalPages}
        count={count}
        onPageChange={(p) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set('page', String(p))
          router.push(`/application/enter/blog?${params.toString()}`)
        }}
      />

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
