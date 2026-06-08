'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, ExternalLink, ImagePlus, Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { slugify } from '@/lib/blog/slugify'
import { toast } from 'sonner'
import {
  createBlogPost,
  suggestBlogSlug,
  updateBlogPost,
  uploadBlogCoverImage,
} from '@/features/blog/admin-actions'
import {
  createAuthorBlogPost,
  suggestAuthorBlogSlug,
  updateAuthorBlogPost,
  uploadAuthorBlogCoverImage,
} from '@/features/blog/author-actions'
import type { BlogCategoryRow, BlogPostRow } from '@/features/blog/schema'
import { BlogPreviewPanel } from './BlogPreviewPanel'

const LexicalPrescriptionEditor = dynamic(
  () =>
    import('@/app/dashboard/_components/LexicalPrescriptionEditor').then((m) => m.LexicalPrescriptionEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-lp-outline-variant/40 bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-lp-brand" />
      </div>
    ),
  }
)

type BlogPostEditorProps = {
  categories: BlogCategoryRow[]
  post?: BlogPostRow | null
  mode?: 'admin' | 'author'
}

export function BlogPostEditor({ categories, post, mode = 'admin' }: BlogPostEditorProps) {
  const isAuthor = mode === 'author'
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const slugTouched = useRef(Boolean(post?.slug))
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [mobileTab, setMobileTab] = useState<'write' | 'preview'>('write')
  const [editorKey, setEditorKey] = useState(0)

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [contentHtml, setContentHtml] = useState(post?.content_html ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(post?.cover_image_url ?? null)
  const [categoryId, setCategoryId] = useState(post?.category_id ?? '')
  const [status, setStatus] = useState<'draft' | 'pending_review' | 'published' | 'archived'>(
    isAuthor
      ? post?.status === 'pending_review'
        ? 'pending_review'
        : 'draft'
      : (post?.status ?? 'draft')
  )
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? '')

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null

  useEffect(() => {
    if (post?.content_html) setEditorKey((k) => k + 1)
  }, [post?.id])

  const handleTitleChange = useCallback(
    async (value: string) => {
      setTitle(value)
      if (!slugTouched.current && value.trim()) {
        const result = isAuthor ? await suggestAuthorBlogSlug(value) : await suggestBlogSlug(value)
        if (result.success) setSlug(result.slug)
      }
    },
    [isAuthor]
  )

  const handleCoverUpload = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.set('file', file)
    const result = isAuthor ? await uploadAuthorBlogCoverImage(fd) : await uploadBlogCoverImage(fd)
    setUploading(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setCoverImageUrl(result.url)
    toast.success('Cover image uploaded')
  }

  const handleSave = () => {
    startTransition(async () => {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugify(title) || 'untitled',
        excerpt: excerpt.trim() || null,
        contentHtml,
        coverImageUrl,
        categoryId: categoryId || null,
        status,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        tags: post?.tags ?? [],
      }

      const authorPayload = {
        ...payload,
        status: status === 'pending_review' ? 'pending_review' as const : 'draft' as const,
      }

      const result = isAuthor
        ? post
          ? await updateAuthorBlogPost(post.id, authorPayload)
          : await createAuthorBlogPost(authorPayload)
        : post
          ? await updateBlogPost(post.id, payload)
          : await createBlogPost(payload)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(
        isAuthor
          ? status === 'pending_review'
            ? 'Submitted for admin review'
            : post
              ? 'Draft saved'
              : 'Draft created'
          : post
            ? 'Article updated'
            : 'Article created'
      )
      if (post) {
        router.refresh()
      } else if ('id' in result) {
        router.replace(
          isAuthor
            ? `/dashboard/blog/${result.id}/edit`
            : `/application/enter/blog/${result.id}/edit`
        )
      }
    })
  }

  const isLockedForAuthor = isAuthor && post?.status === 'pending_review'
  const fieldsDisabled = isPending || isLockedForAuthor

  const canSave =
    !isLockedForAuthor &&
    title.trim().length > 0 &&
    contentHtml.replace(/<[^>]+>/g, '').trim().length > 0 &&
    (isAuthor
      ? status !== 'pending_review' || Boolean(categoryId)
      : !['published', 'pending_review'].includes(status) || Boolean(categoryId))

  const previewUrl = slug.trim() ? `/blog/${slug.trim()}?preview=1` : null

  return (
    <div className="space-y-6">
      <div className="liquid-glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-lp-on-surface">
            {post ? 'Edit article' : 'New article'}
          </h2>
          <p className="mt-1 text-sm text-lp-on-surface-variant">
            {isAuthor
              ? 'Write your article and submit for admin approval. It will go live only after review.'
              : 'Write content, pick a category, and preview before publishing.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {previewUrl && post && (
            <Button asChild variant="outline" size="sm" className="rounded-xl gap-2">
              <Link href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Full preview
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden rounded-xl gap-2 lg:inline-flex"
            onClick={() => setShowPreview((v) => !v)}
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Hide preview' : 'Show preview'}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave || fieldsDisabled}
            className="rounded-xl gap-2 bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand shadow-lg shadow-lp-brand/25"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="liquid-glass space-y-4 rounded-2xl p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blog-title">Title</Label>
                <Input
                  id="blog-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. 5 tips for better telehealth visits"
                  className="rounded-xl"
                  disabled={fieldsDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-slug">URL slug</Label>
                <Input
                  id="blog-slug"
                  value={slug}
                  onChange={(e) => {
                    slugTouched.current = true
                    setSlug(slugify(e.target.value))
                  }}
                  placeholder="5-tips-telehealth"
                  className="rounded-xl font-mono text-sm"
                  disabled={fieldsDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Category{' '}
                  {['published', 'pending_review'].includes(status) && <span className="text-red-500">*</span>}
                </Label>
                <Select value={categoryId || undefined} onValueChange={setCategoryId} disabled={fieldsDisabled}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)} disabled={fieldsDisabled}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    {isAuthor ? (
                      <SelectItem value="pending_review">Submit for review</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="pending_review">Pending review</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {isAuthor && post?.status === 'pending_review' && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    This article is awaiting admin approval and cannot be edited.
                  </p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blog-excerpt">Excerpt</Label>
                <Textarea
                  id="blog-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary for listing cards and SEO…"
                  className="min-h-[80px] rounded-xl resize-none"
                  disabled={fieldsDisabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover image</Label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleCoverUpload(file)
                    e.target.value = ''
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl gap-2"
                  disabled={uploading || fieldsDisabled}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  Upload cover
                </Button>
                {coverImageUrl && (
                  <>
                    <span className="max-w-[200px] truncate text-xs text-lp-on-surface-variant">{coverImageUrl}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-red-600"
                      onClick={() => setCoverImageUrl(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <details className="rounded-xl border border-lp-outline-variant/30 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-lp-on-surface">SEO settings</summary>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="meta-title">Meta title</Label>
                  <Input
                    id="meta-title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || 'Optional override'}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-desc">Meta description</Label>
                  <Textarea
                    id="meta-desc"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={excerpt || 'Optional override'}
                    className="min-h-[72px] rounded-xl resize-none"
                  />
                </div>
              </div>
            </details>
          </div>

          <div className="liquid-glass rounded-2xl p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-2 lg:hidden">
              <div className="flex rounded-xl border border-lp-outline-variant/30 p-1">
                <button
                  type="button"
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    mobileTab === 'write' ? 'bg-lp-brand text-lp-on-brand' : 'text-lp-on-surface-variant'
                  )}
                  onClick={() => setMobileTab('write')}
                >
                  Write
                </button>
                <button
                  type="button"
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    mobileTab === 'preview' ? 'bg-lp-brand text-lp-on-brand' : 'text-lp-on-surface-variant'
                  )}
                  onClick={() => setMobileTab('preview')}
                >
                  Preview
                </button>
              </div>
            </div>

            {(mobileTab === 'write' || showPreview) && (
              <div className={cn(mobileTab === 'preview' && 'hidden lg:block', !showPreview && 'lg:block')}>
                <Label className="mb-2 block">Article body</Label>
                <LexicalPrescriptionEditor
                  key={editorKey}
                  initialHtml={post?.content_html ?? ''}
                  onHtmlChange={setContentHtml}
                  compact
                  className="min-h-[360px] border-lp-outline-variant/40 dark:border-white/10"
                />
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            'min-h-[480px]',
            mobileTab === 'write' ? 'hidden lg:block' : 'block',
            !showPreview && 'hidden lg:hidden'
          )}
        >
          <BlogPreviewPanel
            title={title}
            excerpt={excerpt}
            coverImageUrl={coverImageUrl}
            contentHtml={contentHtml}
            category={selectedCategory}
            className="h-full min-h-[480px] max-h-[calc(100vh-12rem)]"
          />
        </div>
      </div>
    </div>
  )
}
