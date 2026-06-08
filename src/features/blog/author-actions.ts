'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { zodFirstError } from '@/lib/server-action-result'
import { sanitizeBlogContent } from '@/lib/blog/sanitize-html'
import { saveBlogCoverImage, deleteBlogCoverImage } from '@/lib/blog/upload-cover-image'
import { slugify } from '@/lib/blog/slugify'
import { requireBlogAuthor } from './auth'
import { blogPostAuthorSchema, type BlogPostRow } from './schema'

const POST_SELECT = `
  *,
  category:blog_categories(id, name, slug, description, sort_order, is_active, created_at, updated_at),
  author:users!blog_posts_author_id_fkey(id, name, image)
`

function mapPost(row: Record<string, unknown>): BlogPostRow {
  return row as unknown as BlogPostRow
}

export async function getMyBlogPosts(page = 1, limit = 10) {
  const auth = await requireBlogAuthor()
  if (!auth.ok) return { success: false as const, error: auth.error, data: [], count: 0 }

  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('blog_posts')
    .select(POST_SELECT, { count: 'exact' })
    .eq('author_id', auth.user.id)
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (error) return { success: false as const, error: error.message, data: [], count: 0 }
  return { success: true as const, data: (data || []).map(mapPost), count: count ?? 0 }
}

export async function getMyBlogPostById(id: string) {
  const auth = await requireBlogAuthor()
  if (!auth.ok) return { success: false as const, error: auth.error, data: null }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select(POST_SELECT)
    .eq('id', id)
    .eq('author_id', auth.user.id)
    .maybeSingle()

  if (error) return { success: false as const, error: error.message, data: null }
  if (!data) return { success: false as const, error: 'Article not found.', data: null }
  return { success: true as const, data: mapPost(data) }
}

export async function createAuthorBlogPost(input: unknown) {
  const auth = await requireBlogAuthor()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = blogPostAuthorSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const now = new Date().toISOString()
  const isSubmitted = parsed.data.status === 'pending_review'

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt ?? null,
      content_html: sanitizeBlogContent(parsed.data.contentHtml),
      cover_image_url: parsed.data.coverImageUrl ?? null,
      category_id: parsed.data.categoryId ?? null,
      author_id: auth.user.id,
      status: parsed.data.status,
      published_at: null,
      submitted_at: isSubmitted ? now : null,
      meta_title: parsed.data.metaTitle ?? null,
      meta_description: parsed.data.metaDescription ?? null,
      tags: parsed.data.tags,
      updated_at: now,
    })
    .select('id, slug')
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/dashboard/blog')
  return { success: true as const, id: data!.id, slug: data!.slug }
}

export async function updateAuthorBlogPost(id: string, input: unknown) {
  const auth = await requireBlogAuthor()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const parsed = blogPostAuthorSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('slug, status, cover_image_url, submitted_at')
    .eq('id', id)
    .eq('author_id', auth.user.id)
    .maybeSingle()

  if (!existing) return { success: false as const, error: 'Article not found or cannot be edited.' }
  if (!['draft', 'pending_review'].includes(existing.status)) {
    return { success: false as const, error: 'Only draft or pending articles can be edited.' }
  }

  const now = new Date().toISOString()
  const isSubmitted = parsed.data.status === 'pending_review'
  let submittedAt = existing.submitted_at ?? null
  if (isSubmitted && !submittedAt) submittedAt = now

  if (
    existing.cover_image_url &&
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
      published_at: null,
      submitted_at: isSubmitted ? submittedAt : null,
      meta_title: parsed.data.metaTitle ?? null,
      meta_description: parsed.data.metaDescription ?? null,
      tags: parsed.data.tags,
      updated_at: now,
    })
    .eq('id', id)
    .eq('author_id', auth.user.id)
    .select('slug')
    .single()

  if (error) return { success: false as const, error: error.message }
  revalidatePath('/dashboard/blog')
  revalidatePath(`/dashboard/blog/${id}/edit`)
  if (existing.slug) revalidatePath(`/blog/${existing.slug}`)
  if (data?.slug) revalidatePath(`/blog/${data.slug}`)
  return { success: true as const, slug: data!.slug }
}

export async function deleteAuthorBlogPost(id: string) {
  const auth = await requireBlogAuthor()
  if (!auth.ok) return { success: false as const, error: auth.error }

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('slug, cover_image_url, status')
    .eq('id', id)
    .eq('author_id', auth.user.id)
    .maybeSingle()

  if (!existing) return { success: false as const, error: 'Article not found.' }
  if (!['draft', 'pending_review'].includes(existing.status)) {
    return { success: false as const, error: 'Only draft or pending articles can be deleted.' }
  }

  const { error } = await supabase.from('blog_posts').delete().eq('id', id).eq('author_id', auth.user.id)
  if (error) return { success: false as const, error: error.message }

  if (existing.cover_image_url) await deleteBlogCoverImage(existing.cover_image_url)
  revalidatePath('/dashboard/blog')
  return { success: true as const }
}

export async function uploadAuthorBlogCoverImage(formData: FormData) {
  const auth = await requireBlogAuthor()
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

export async function suggestAuthorBlogSlug(title: string) {
  const auth = await requireBlogAuthor()
  if (!auth.ok) return { success: false as const, error: auth.error, slug: slugify(title) || 'post' }

  const base = slugify(title) || 'post'
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
