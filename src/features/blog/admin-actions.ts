'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { zodFirstError } from '@/lib/server-action-result'
import { requireAdmin } from '@/features/admin/actions'
import { sanitizeBlogContent } from '@/lib/blog/sanitize-html'
import { saveBlogCoverImage, deleteBlogCoverImage } from '@/lib/blog/upload-cover-image'
import { slugify } from '@/lib/blog/slugify'
import {
  blogCategorySchema,
  blogCommentStatusSchema,
  blogPostSchema,
  type BlogCategoryRow,
  type BlogCommentRow,
  type BlogPostRow,
} from './schema'

const POST_SELECT = `
  *,
  category:blog_categories(id, name, slug, description, sort_order, is_active, created_at, updated_at),
  author:users!blog_posts_author_id_fkey(id, name, image)
`

function mapPost(row: Record<string, unknown>): BlogPostRow {
  return row as unknown as BlogPostRow
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getBlogCategoriesAdmin(includeInactive = true) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [] as BlogCategoryRow[] }

  const supabase = await createClient()
  let query = supabase.from('blog_categories').select('*').order('sort_order').order('name')

  if (!includeInactive) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) return { success: false as const, error: error.message, data: [] as BlogCategoryRow[] }
  return { success: true as const, data: (data || []) as BlogCategoryRow[] }
}

export async function createBlogCategory(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = blogCategorySchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase.from('blog_categories').insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    sort_order: parsed.data.sortOrder,
    is_active: parsed.data.isActive,
  })

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/blog/categories')
  revalidatePath('/blog')
  return { success: true as const }
}

export async function updateBlogCategory(id: string, input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = blogCategorySchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase
    .from('blog_categories')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/blog/categories')
  revalidatePath('/blog')
  return { success: true as const }
}

export async function deleteBlogCategory(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const { count } = await supabase
    .from('blog_posts')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if ((count ?? 0) > 0) {
    return { success: false as const, error: 'Cannot delete a category that has blog posts. Archive it instead.' }
  }

  const { error } = await supabase.from('blog_categories').delete().eq('id', id)
  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/blog/categories')
  return { success: true as const }
}

// ─── Posts ──────────────────────────────────────────────────────────────────

export async function getBlogPostsAdmin(
  page = 1,
  limit = 10,
  search?: string,
  status?: string,
  categoryId?: string
) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }

  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('blog_posts')
    .select(POST_SELECT, { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (search?.trim()) {
    const term = search.trim()
    query = query.or(`title.ilike.%${term}%,slug.ilike.%${term}%`)
  }
  if (status && status !== 'all') query = query.eq('status', status)
  if (categoryId && categoryId !== 'all') query = query.eq('category_id', categoryId)

  const { data, error, count } = await query
  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: (data || []).map(mapPost), count: count ?? 0 }
}

export async function getBlogPostByIdAdmin(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: null }

  const supabase = await createClient()
  const { data, error } = await supabase.from('blog_posts').select(POST_SELECT).eq('id', id).single()
  if (error) return { success: false as const, error: error.message, data: null }
  return { success: true as const, data: mapPost(data) }
}

export async function createBlogPost(input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = blogPostSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const now = new Date().toISOString()
  const isPublished = parsed.data.status === 'published'
  const isPending = parsed.data.status === 'pending_review'

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt ?? null,
      content_html: sanitizeBlogContent(parsed.data.contentHtml),
      cover_image_url: parsed.data.coverImageUrl ?? null,
      category_id: parsed.data.categoryId ?? null,
      author_id: user?.id ?? null,
      status: parsed.data.status,
      published_at: isPublished ? now : null,
      submitted_at: isPending ? now : null,
      meta_title: parsed.data.metaTitle ?? null,
      meta_description: parsed.data.metaDescription ?? null,
      tags: parsed.data.tags,
      updated_at: now,
    })
    .select('id, slug')
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/blog')
  revalidatePath('/blog')
  if (data?.slug) revalidatePath(`/blog/${data.slug}`)
  return { success: true as const, id: data!.id, slug: data!.slug }
}

export async function updateBlogPost(id: string, input: unknown) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = blogPostSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('slug, status, published_at, submitted_at, cover_image_url')
    .eq('id', id)
    .single()

  const now = new Date().toISOString()
  const isPublished = parsed.data.status === 'published'
  const isPending = parsed.data.status === 'pending_review'
  let publishedAt: string | null = null
  if (isPublished) {
    publishedAt = existing?.published_at ?? now
  }
  let submittedAt = existing?.submitted_at ?? null
  if (isPending && !submittedAt) submittedAt = now
  if (!isPending && existing?.status === 'pending_review' && parsed.data.status === 'draft') {
    submittedAt = null
  }

  if (
    existing?.cover_image_url &&
    parsed.data.coverImageUrl &&
    existing.cover_image_url !== parsed.data.coverImageUrl
  ) {
    await deleteBlogCoverImage(existing.cover_image_url)
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt ?? null,
      content_html: sanitizeBlogContent(parsed.data.contentHtml),
      cover_image_url: parsed.data.coverImageUrl ?? null,
      category_id: parsed.data.categoryId ?? null,
      status: parsed.data.status,
      published_at: publishedAt,
      submitted_at: isPending
        ? submittedAt ?? now
        : parsed.data.status === 'draft'
          ? null
          : submittedAt,
      meta_title: parsed.data.metaTitle ?? null,
      meta_description: parsed.data.metaDescription ?? null,
      tags: parsed.data.tags,
      updated_at: now,
    })
    .eq('id', id)
    .select('slug')
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/blog')
  revalidatePath('/blog')
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)
  if (data?.slug) revalidatePath(`/blog/${data.slug}`)
  return { success: true as const, slug: data!.slug }
}

export async function approveBlogPost(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('slug, status, category_id')
    .eq('id', id)
    .single()

  if (!existing) return { success: false as const, error: 'Article not found.' }
  if (existing.status !== 'pending_review') {
    return { success: false as const, error: 'Only articles pending review can be approved.' }
  }
  if (!existing.category_id) {
    return { success: false as const, error: 'Assign a category before approving.' }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('blog_posts')
    .update({
      status: 'published',
      published_at: now,
      reviewed_at: now,
      reviewed_by: user?.id ?? null,
      updated_at: now,
    })
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/blog')
  revalidatePath('/blog')
  if (existing.slug) revalidatePath(`/blog/${existing.slug}`)
  return { success: true as const }
}

export async function rejectBlogPost(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('slug, status')
    .eq('id', id)
    .single()

  if (!existing) return { success: false as const, error: 'Article not found.' }
  if (existing.status !== 'pending_review') {
    return { success: false as const, error: 'Only articles pending review can be rejected.' }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('blog_posts')
    .update({
      status: 'draft',
      published_at: null,
      submitted_at: null,
      reviewed_at: now,
      reviewed_by: user?.id ?? null,
      updated_at: now,
    })
    .eq('id', id)

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/application/enter/blog')
  revalidatePath('/dashboard/blog')
  return { success: true as const }
}

export async function deleteBlogPost(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const { data: existing } = await supabase.from('blog_posts').select('slug, cover_image_url').eq('id', id).single()

  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) return { success: false as const, error: error.message }

  if (existing?.cover_image_url) await deleteBlogCoverImage(existing.cover_image_url)
  revalidatePath('/application/enter/blog')
  revalidatePath('/blog')
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)
  return { success: true as const }
}

export async function uploadBlogCoverImage(formData: FormData) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { success: false as const, error: 'Please choose an image file.' }
  }

  try {
    const url = await saveBlogCoverImage(file)
    return { success: true as const, url }
  } catch (e: unknown) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Upload failed.' }
  }
}

export async function suggestBlogSlug(title: string) {
  const base = slugify(title) || 'post'
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, slug: base }

  const supabase = await createClient()
  let candidate = base
  let n = 1
  while (n < 100) {
    const { data } = await supabase.from('blog_posts').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return { success: true as const, slug: candidate }
    candidate = `${base}-${n}`
    n += 1
  }
  return { success: true as const, slug: `${base}-${Date.now()}` }
}

const COMMENT_ADMIN_SELECT = `
  id, post_id, user_id, parent_id, body, status, reviewed_at, reviewed_by, created_at, updated_at,
  user:users!blog_comments_user_id_fkey(id, name, image, role),
  post:blog_posts!blog_comments_post_id_fkey(id, title, slug)
`

function mapCommentRow(row: Record<string, unknown>): BlogCommentRow {
  const user = row.user
  const post = row.post
  const normalizedUser = Array.isArray(user) ? user[0] : user
  const normalizedPost = Array.isArray(post) ? post[0] : post
  return {
    ...(row as Omit<BlogCommentRow, 'user' | 'post' | 'parent_id'>),
    parent_id: (row.parent_id as string | null) ?? null,
    user: normalizedUser as BlogCommentRow['user'],
    post: normalizedPost as BlogCommentRow['post'],
  }
}

export async function getBlogCommentsAdmin(
  page = 1,
  limit = 15,
  status: string = 'pending',
  search?: string
) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }

  const parsedStatus = blogCommentStatusSchema.safeParse(status)
  const filterStatus = parsedStatus.success ? parsedStatus.data : 'pending'

  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('blog_comments')
    .select(COMMENT_ADMIN_SELECT, { count: 'exact' })
    .eq('status', filterStatus)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search?.trim()) {
    const term = search.trim()
    query = query.ilike('body', `%${term}%`)
  }

  const { data, error, count } = await query
  if (error) return { success: false as const, error: error.message, data: [], count: 0 }

  return {
    success: true as const,
    data: (data || []).map((row) => mapCommentRow(row as Record<string, unknown>)),
    count: count ?? 0,
  }
}

export async function approveBlogComment(commentId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: existing } = await supabase
    .from('blog_comments')
    .select('id, status, post_id')
    .eq('id', commentId)
    .is('deleted_at', null)
    .single()

  if (!existing) return { success: false as const, error: 'Comment not found.' }
  if (existing.status !== 'pending') {
    return { success: false as const, error: 'Only pending comments can be approved.' }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('blog_comments')
    .update({
      status: 'approved',
      reviewed_at: now,
      reviewed_by: user?.id ?? null,
      updated_at: now,
    })
    .eq('id', commentId)

  if (error) return { success: false as const, error: error.message }

  const { data: post } = await supabase.from('blog_posts').select('slug').eq('id', existing.post_id).single()
  if (post?.slug) revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/application/enter/blog/comments')
  return { success: true as const }
}

export async function rejectBlogComment(commentId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: existing } = await supabase
    .from('blog_comments')
    .select('id, status, post_id')
    .eq('id', commentId)
    .is('deleted_at', null)
    .single()

  if (!existing) return { success: false as const, error: 'Comment not found.' }
  if (existing.status !== 'pending') {
    return { success: false as const, error: 'Only pending comments can be rejected.' }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('blog_comments')
    .update({
      status: 'rejected',
      reviewed_at: now,
      reviewed_by: user?.id ?? null,
      updated_at: now,
    })
    .eq('id', commentId)

  if (error) return { success: false as const, error: error.message }

  const { data: post } = await supabase.from('blog_posts').select('slug').eq('id', existing.post_id).single()
  if (post?.slug) revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/application/enter/blog/comments')
  return { success: true as const }
}

export async function adminSoftDeleteComment(commentId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const { data: comment } = await supabase.from('blog_comments').select('post_id').eq('id', commentId).single()
  const { error } = await supabase
    .from('blog_comments')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', commentId)

  if (error) return { success: false as const, error: error.message }
  if (comment?.post_id) {
    const { data: post } = await supabase.from('blog_posts').select('slug').eq('id', comment.post_id).single()
    if (post?.slug) revalidatePath(`/blog/${post.slug}`)
  }
  return { success: true as const }
}
