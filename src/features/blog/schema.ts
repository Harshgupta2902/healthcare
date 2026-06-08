import { z } from 'zod'

export const blogPostStatusSchema = z.enum(['draft', 'pending_review', 'published', 'archived'])
export const blogPostAuthorStatusSchema = z.enum(['draft', 'pending_review'])

export const blogCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  description: z.string().max(300).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
})

const blogPostFieldsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  excerpt: z.string().max(500).optional().nullable(),
  contentHtml: z.string().min(1, 'Content is required').max(800_000),
  coverImageUrl: z.string().max(500).optional().nullable(),
  categoryId: z.string().uuid('Category is required').optional().nullable(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  tags: z.array(z.string().max(40)).max(10).default([]),
})

export const blogPostSchema = blogPostFieldsSchema
  .extend({
    status: blogPostStatusSchema.default('draft'),
  })
  .superRefine((data, ctx) => {
    if (['published', 'pending_review'].includes(data.status) && !data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category is required to publish or submit for review',
        path: ['categoryId'],
      })
    }
  })

export const blogPostAuthorSchema = blogPostFieldsSchema
  .extend({
    status: blogPostAuthorStatusSchema.default('draft'),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'pending_review' && !data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category is required to submit for review',
        path: ['categoryId'],
      })
    }
  })

export const blogCommentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().min(1, 'Comment cannot be empty').max(2000),
  parentId: z.string().uuid().optional().nullable(),
})

export const blogViewSchema = z.object({
  postId: z.string().uuid(),
  viewerKey: z.string().min(8).max(128),
})

export const blogLikeSchema = z.object({
  postId: z.string().uuid(),
})

export type BlogPostFormData = z.infer<typeof blogPostSchema>
export type BlogPostAuthorFormData = z.infer<typeof blogPostAuthorSchema>
export type BlogCategoryFormData = z.infer<typeof blogCategorySchema>

export type BlogCategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type BlogPostRow = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content_html: string
  cover_image_url: string | null
  category_id: string | null
  author_id: string | null
  status: 'draft' | 'pending_review' | 'published' | 'archived'
  published_at: string | null
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  meta_title: string | null
  meta_description: string | null
  tags: string[]
  view_count: number
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  category?: BlogCategoryRow | null
  author?: { id: string; name: string; image: string | null } | null
}

export type BlogCommentRow = {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  body: string
  created_at: string
  updated_at: string
  user?: { id: string; name: string; image: string | null; role: string } | null
}

export type BlogCommentNode = BlogCommentRow & { replies: BlogCommentNode[] }
