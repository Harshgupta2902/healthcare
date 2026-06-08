import { BlogArticleContent } from '@/components/blog/BlogArticleContent'
import { cn } from '@/lib/utils'

type BlogArticleBodyProps = {
  html: string
  className?: string
}

export function BlogArticleBody({ html, className }: BlogArticleBodyProps) {
  return <BlogArticleContent content={html} className={className} />
}
