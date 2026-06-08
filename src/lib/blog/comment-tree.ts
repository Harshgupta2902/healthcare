import type { BlogCommentNode, BlogCommentRow } from '@/features/blog/schema'

/** Flat comment list → nested tree (top-level + replies). */
export function buildCommentTree(comments: BlogCommentRow[]): BlogCommentNode[] {
  const nodes = new Map<string, BlogCommentNode>()
  const roots: BlogCommentNode[] = []

  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, replies: [] })
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id)!
    if (comment.parent_id && nodes.has(comment.parent_id)) {
      nodes.get(comment.parent_id)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
