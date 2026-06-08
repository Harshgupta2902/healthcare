const BLOCKED_TAGS = /<\/?(?:script|iframe|object|embed|form|input|button|meta|link|base|style)[^>]*>/gi
const EVENT_HANDLERS = /\s(on\w+|javascript:)[^>]*/gi

/** True when text (not HTML) looks like Markdown syntax. */
export function hasMarkdownSyntax(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false

  return (
    /^#{1,6}\s/m.test(trimmed) ||
    /^\s*[-*+]\s/m.test(trimmed) ||
    /^\s*\d+\.\s/m.test(trimmed) ||
    /\*\*[^*\n]+\*\*/.test(trimmed) ||
    /__[^_\n]+__/.test(trimmed) ||
    /\[[^\]]+\]\([^)]+\)/.test(trimmed) ||
    /^>\s/m.test(trimmed) ||
    /^```/m.test(trimmed) ||
    /^\|.+\|/m.test(trimmed) ||
    /^---+$/m.test(trimmed) ||
    /`[^`\n]+`/.test(trimmed)
  )
}

/** Convert shallow HTML (e.g. Lexical <p>/<div> wrappers) back to a Markdown source string. */
export function htmlToPlainMarkdownSource(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<\/div>\s*<div[^>]*>/gi, '\n\n')
    .replace(/<\/li>\s*<li[^>]*>/gi, '\n')
    .replace(/<\/?p[^>]*>/gi, '')
    .replace(/<\/?div[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Heuristic: treat stored blog body as Markdown vs legacy HTML. */
export function isLikelyMarkdown(content: string): boolean {
  const trimmed = content.trim()
  if (!trimmed) return false

  if (hasMarkdownSyntax(trimmed)) {
    return true
  }

  if (/<[a-z]/i.test(trimmed)) {
    const plain = htmlToPlainMarkdownSource(trimmed)
    return hasMarkdownSyntax(plain)
  }

  return false
}

export type PreparedBlogContent = {
  format: 'markdown' | 'html'
  value: string
}

const RICH_HTML_PATTERN =
  /<\/?(?:h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|pre|code|strong|em|a|img)\b/i

/** Normalize stored blog body for rendering (handles MD, HTML, and HTML-wrapped MD). */
export function prepareBlogContentForRender(content: string): PreparedBlogContent {
  const trimmed = content?.trim() ?? ''
  if (!trimmed) return { format: 'markdown', value: '' }

  const plainFromHtml = htmlToPlainMarkdownSource(trimmed)
  const hasRealHtml = RICH_HTML_PATTERN.test(trimmed)

  if (hasRealHtml && !hasMarkdownSyntax(plainFromHtml)) {
    return { format: 'html', value: sanitizeBlogHtml(trimmed) }
  }

  if (hasMarkdownSyntax(trimmed) && !/<[a-z]/i.test(trimmed)) {
    return { format: 'markdown', value: trimmed }
  }

  if (hasMarkdownSyntax(plainFromHtml) || (/<[a-z]/i.test(trimmed) && plainFromHtml.length > 0)) {
    return { format: 'markdown', value: plainFromHtml }
  }

  return { format: 'html', value: sanitizeBlogHtml(trimmed) }
}

/** Strip dangerous markup before storing or rendering legacy HTML blog content. */
export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return ''
  return html
    .replace(BLOCKED_TAGS, '')
    .replace(EVENT_HANDLERS, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

/** Sanitize blog body for storage — normalizes Markdown, strips unsafe HTML. */
export function sanitizeBlogContent(content: string): string {
  const prepared = prepareBlogContentForRender(content)
  return prepared.value
}
