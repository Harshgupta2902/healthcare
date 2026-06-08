import { sanitizeBlogHtml } from '@/lib/blog/sanitize-html'
import { cn } from '@/lib/utils'

type BlogArticleBodyProps = {
  html: string
  className?: string
}

export function BlogArticleBody({ html, className }: BlogArticleBodyProps) {
  const safe = sanitizeBlogHtml(html)
  if (!safe.trim()) return null

  return (
    <div
      className={cn(
        'prose prose-lg max-w-none dark:prose-invert',
        'prose-headings:font-heading prose-headings:text-lp-on-surface prose-headings:font-bold',
        'prose-p:text-lp-on-surface-variant prose-p:leading-relaxed',
        'prose-a:text-lp-brand prose-a:no-underline hover:prose-a:underline',
        'prose-li:text-lp-on-surface-variant',
        'prose-blockquote:border-lp-brand/30 prose-blockquote:text-lp-on-surface-variant',
        className
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
