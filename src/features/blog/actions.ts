'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabasePublic } from '@/lib/supabase/public'
import { revalidatePath } from 'next/cache'
import { zodFirstError } from '@/lib/server-action-result'
import { sanitizeBlogHtml } from '@/lib/blog/sanitize-html'
import { requireAuthorBlogPreview, requireBlogEngagementUser } from './auth'
import {
  blogCommentSchema,
  blogLikeSchema,
  blogViewSchema,
  type BlogCategoryRow,
  type BlogCommentRow,
  type BlogPostRow,
} from './schema'

const POST_LIST_SELECT = `
  id, slug, title, excerpt, cover_image_url, category_id, status, published_at,
  view_count, like_count, comment_count, tags, created_at, updated_at,
  category:blog_categories(id, name, slug, description, sort_order, is_active, created_at, updated_at),
  author:users!blog_posts_author_id_fkey(id, name, image)
`

const POST_DETAIL_SELECT = `${POST_LIST_SELECT}, content_html, meta_title, meta_description, author_id`

function mapPost(row: Record<string, unknown>): BlogPostRow {
  return row as unknown as BlogPostRow
}

function mapCommentRow(row: Record<string, unknown>): BlogCommentRow {
  const user = row.user
  const normalizedUser = Array.isArray(user) ? user[0] : user
  return {
    ...(row as Omit<BlogCommentRow, 'user' | 'parent_id'>),
    parent_id: (row.parent_id as string | null) ?? null,
    user: normalizedUser as BlogCommentRow['user'],
  }
}

export async function getActiveBlogCategories(): Promise<BlogCategoryRow[]> {
  try {
    const supabase = createSupabasePublic()
    const { data } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .order('name')
    return (data || []) as BlogCategoryRow[]
  } catch {
    return []
  }
}

export async function getPublishedBlogPosts(options: {
  page?: number
  limit?: number
  categorySlug?: string
}) {
  const page = options.page ?? 1
  const limit = options.limit ?? 9
  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    const supabase = createSupabasePublic()
    let query = supabase
      .from('blog_posts')
      .select(POST_LIST_SELECT, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to)

    if (options.categorySlug) {
      const { data: cat } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('slug', options.categorySlug)
        .eq('is_active', true)
        .maybeSingle()
      if (cat?.id) query = query.eq('category_id', cat.id)
      else return { success: true as const, data: [], count: 0, totalPages: 0 }
    }

    const { data, error, count } = await query
    if (error) return { success: false as const, error: error.message, data: [], count: 0, totalPages: 0 }
    const total = count ?? 0
    return {
      success: true as const,
      data: (data || []).map(mapPost),
      count: total,
      totalPages: Math.ceil(total / limit),
    }
  } catch (e: unknown) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : 'Failed to load posts.',
      data: [],
      count: 0,
      totalPages: 0,
    }
  }
}

export async function getBlogPostBySlug(slug: string, preview = false) {
  try {
    const supabase = preview ? await createClient() : createSupabasePublic()

    let query = supabase.from('blog_posts').select(POST_DETAIL_SELECT).eq('slug', slug)
    if (!preview) {
      query = query.eq('status', 'published')
    }

    const { data, error } = await query.maybeSingle()
    if (error) return { success: false as const, error: error.message, data: null }
    if (!data) return { success: false as const, error: 'Post not found.', data: null }

    if (preview) {
      const auth = await requireAuthorBlogPreview(data.author_id as string | null)
      if (!auth.ok) return { success: false as const, error: auth.error, data: null }
      if (!['draft', 'pending_review', 'published', 'archived'].includes(data.status as string)) {
        return { success: false as const, error: 'Post not found.', data: null }
      }
    }
    return { success: true as const, data: mapPost(data), isPreview: preview }
  } catch (e: unknown) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Failed to load post.', data: null }
  }
}

export async function getRelatedBlogPosts(postId: string, categoryId: string | null, limit = 3) {
  if (!categoryId) return []
  try {
    const supabase = createSupabasePublic()
    const { data } = await supabase
      .from('blog_posts')
      .select(POST_LIST_SELECT)
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', postId)
      .order('published_at', { ascending: false })
      .limit(limit)
    return (data || []).map(mapPost)
  } catch {
    return []
  }
}

export async function getBlogComments(postId: string, page = 1, limit = 20) {
  try {
    const supabase = createSupabasePublic()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('blog_comments')
      .select(
        `id, post_id, user_id, parent_id, body, created_at, updated_at,
         user:users!blog_comments_user_id_fkey(id, name, image, role)`,
        { count: 'exact' }
      )
      .eq('post_id', postId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) return { success: false as const, error: error.message, data: [], count: 0 }
    return {
      success: true as const,
      data: (data || []).map((row) => mapCommentRow(row as Record<string, unknown>)),
      count: count ?? 0,
    }
  } catch (e: unknown) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Failed to load comments.', data: [], count: 0 }
  }
}

export async function getCurrentUserLike(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('blog_post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  return Boolean(data)
}

export async function recordBlogPostView(input: unknown) {
  const parsed = blogViewSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  try {
    const supabase = createSupabasePublic()
    const { data, error } = await supabase.rpc('increment_blog_post_view', {
      p_post_id: parsed.data.postId,
      p_viewer_key: parsed.data.viewerKey,
    })

    if (error) return { success: false as const, error: error.message }
    return { success: true as const, viewCount: Number(data ?? 0) }
  } catch (e: unknown) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Failed to record view.' }
  }
}

export async function toggleBlogPostLike(input: unknown) {
  const auth = await requireBlogEngagementUser()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = blogLikeSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('toggle_blog_post_like', {
    p_post_id: parsed.data.postId,
    p_user_id: auth.user.id,
  })

  if (error) return { success: false as const, error: error.message }

  const result = data as { liked?: boolean; likeCount?: number } | null
  const { data: post } = await supabase.from('blog_posts').select('slug').eq('id', parsed.data.postId).single()
  if (post?.slug) revalidatePath(`/blog/${post.slug}`)

  return {
    success: true as const,
    liked: Boolean(result?.liked),
    likeCount: Number(result?.likeCount ?? 0),
  }
}

export async function createBlogComment(input: unknown) {
  const auth = await requireBlogEngagementUser()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = blogCommentSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()

  if (parsed.data.parentId) {
    const { data: parent } = await supabase
      .from('blog_comments')
      .select('id, post_id, deleted_at')
      .eq('id', parsed.data.parentId)
      .single()

    if (!parent || parent.deleted_at || parent.post_id !== parsed.data.postId) {
      return { success: false as const, error: 'Invalid reply target.' }
    }
  }

  const { data, error } = await supabase
    .from('blog_comments')
    .insert({
      post_id: parsed.data.postId,
      user_id: auth.user.id,
      parent_id: parsed.data.parentId ?? null,
      body: parsed.data.body.trim(),
    })
    .select(
      `id, post_id, user_id, parent_id, body, created_at, updated_at,
       user:users!blog_comments_user_id_fkey(id, name, image, role)`
    )
    .single()

  if (error) return { success: false as const, error: error.message }

  const { data: post } = await supabase.from('blog_posts').select('slug').eq('id', parsed.data.postId).single()
  if (post?.slug) revalidatePath(`/blog/${post.slug}`)

  return { success: true as const, comment: mapCommentRow(data as Record<string, unknown>) }
}

export async function deleteOwnBlogComment(commentId: string) {
  const auth = await requireBlogEngagementUser()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const { data: comment } = await supabase
    .from('blog_comments')
    .select('post_id')
    .eq('id', commentId)
    .eq('user_id', auth.user.id)
    .single()

  if (!comment) return { success: false as const, error: 'Comment not found.' }

  const { error } = await supabase
    .from('blog_comments')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', auth.user.id)

  if (error) return { success: false as const, error: error.message }

  const { data: post } = await supabase.from('blog_posts').select('slug').eq('id', comment.post_id).single()
  if (post?.slug) revalidatePath(`/blog/${post.slug}`)
  return { success: true as const }
}
