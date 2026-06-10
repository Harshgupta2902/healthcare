'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Check, ExternalLink, X } from 'lucide-react'
import { DataTable } from '../../_components/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { approveBlogComment, rejectBlogComment } from '@/features/blog/admin-actions'
import type { BlogCommentRow } from '@/features/blog/schema'
import { toast } from 'sonner'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  }
  return (
    <Badge variant="secondary" className={map[status] ?? ''}>
      {status}
    </Badge>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

type BlogCommentsTableProps = {
  initialData: BlogCommentRow[]
  initialPage: number
  totalPages: number
  count: number
  initialStatus?: string
}

export function BlogCommentsTable({
  initialData,
  initialPage,
  totalPages,
  count,
  initialStatus = 'pending',
}: BlogCommentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const pushFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === 'all') params.delete(k)
      else params.set(k, v)
    })
    params.delete('page')
    router.push(`/application/enter/blog/comments?${params.toString()}`)
  }

  const handleApprove = (item: BlogCommentRow) => {
    startTransition(async () => {
      const result = await approveBlogComment(item.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Comment approved')
      router.refresh()
    })
  }

  const handleReject = (item: BlogCommentRow) => {
    startTransition(async () => {
      const result = await rejectBlogComment(item.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Comment rejected')
      router.refresh()
    })
  }

  return (
    <DataTable
      data={initialData}
      searchPlaceholder="Search comment text…"
      onSearch={(query) => pushFilters({ search: query || undefined })}
      searchExtra={
        <Select value={initialStatus} onValueChange={(value) => pushFilters({ status: value })}>
          <SelectTrigger className="w-[160px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      }
      columns={[
        {
          key: 'body',
          label: 'Comment',
          render: (item) => (
            <div className="max-w-md space-y-1">
              <p className="line-clamp-3 text-sm text-lp-on-surface">{item.body}</p>
              {item.parent_id && (
                <p className="text-xs text-lp-on-surface-variant">Reply to another comment</p>
              )}
            </div>
          ),
        },
        {
          key: 'user',
          label: 'Author',
          render: (item) => (
            <div>
              <p className="text-sm font-medium">{item.user?.name ?? 'Unknown'}</p>
              <p className="text-xs capitalize text-lp-on-surface-variant">{item.user?.role ?? '—'}</p>
            </div>
          ),
        },
        {
          key: 'post',
          label: 'Article',
          render: (item) =>
            item.post?.slug ? (
              <Link
                href={`/blog/${item.post.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm text-lp-brand hover:underline"
              >
                <span className="line-clamp-2">{item.post.title}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </Link>
            ) : (
              '—'
            ),
        },
        {
          key: 'status',
          label: 'Status',
          render: (item) => statusBadge(item.status),
        },
        {
          key: 'created_at',
          label: 'Submitted',
          render: (item) => (
            <span className="text-sm text-lp-on-surface-variant">{formatDate(item.created_at)}</span>
          ),
        },
      ]}
      renderRowActions={(item) =>
        item.status === 'pending' ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg text-emerald-600 hover:text-emerald-700"
              disabled={isPending}
              onClick={() => handleApprove(item)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg text-red-600 hover:text-red-700"
              disabled={isPending}
              onClick={() => handleReject(item)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : null
      }
      page={initialPage}
      totalPages={totalPages}
      onPageChange={(page) => {
        const params = new URLSearchParams(searchParams.toString())
        if (page <= 1) params.delete('page')
        else params.set('page', String(page))
        router.push(`/application/enter/blog/comments?${params.toString()}`)
      }}
      count={count}
    />
  )
}
