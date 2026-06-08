'use client'

import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { prepareBlogContentForRender } from '@/lib/blog/sanitize-html'
import { cn } from '@/lib/utils'

const proseClasses = cn(
  'prose prose-lg max-w-none dark:prose-invert',
  'prose-headings:font-heading prose-headings:text-lp-on-surface prose-headings:font-bold',
  'prose-headings:mt-10 prose-headings:mb-4 first:prose-headings:mt-0',
  'prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl prose-h3:font-semibold',
  'prose-p:mb-5 prose-p:text-lp-on-surface-variant prose-p:leading-relaxed prose-p:text-base',
  'prose-ul:my-6 prose-ul:space-y-2 prose-ol:my-6 prose-ol:space-y-2',
  'prose-li:text-lp-on-surface-variant prose-li:leading-relaxed',
  'prose-hr:my-10 prose-hr:border-lp-outline-variant/30',
  'prose-a:text-lp-brand prose-a:font-medium prose-a:no-underline hover:prose-a:underline',
  'prose-blockquote:my-6 prose-blockquote:border-lp-brand/30 prose-blockquote:text-lp-on-surface-variant',
  'prose-code:text-lp-brand prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:my-6 prose-pre:rounded-xl prose-pre:bg-lp-surface-container-high prose-pre:text-lp-on-surface'
)

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h2 className="mb-4 mt-10 font-heading text-3xl font-bold text-lp-on-surface first:mt-0">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="mb-4 mt-10 font-heading text-2xl font-bold text-lp-on-surface first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-8 font-heading text-xl font-semibold text-lp-on-surface">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-6 font-heading text-lg font-semibold text-lp-on-surface">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mb-5 text-base leading-relaxed text-lp-on-surface-variant last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-6 list-disc space-y-2 pl-6 text-lp-on-surface-variant">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-6 list-decimal space-y-2 pl-6 text-lp-on-surface-variant">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  hr: () => <hr className="my-10 border-lp-outline-variant/30" />,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-lp-brand/30 py-1 pl-4 italic text-lp-on-surface-variant">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-lp-brand underline-offset-4 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-lp-on-surface">{children}</strong>,
  em: ({ children }) => <em className="italic text-lp-on-surface-variant">{children}</em>,
  code: ({ children }) => (
    <code className="rounded-md bg-lp-surface-container-high px-1.5 py-0.5 font-mono text-sm text-lp-brand">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-lp-surface-container-high p-4 text-sm text-lp-on-surface">
      {children}
    </pre>
  ),
}

type BlogArticleContentProps = {
  content: string
  className?: string
  /** Smaller typography for editor preview panels. */
  size?: 'default' | 'sm'
}

export function BlogArticleContent({ content, className, size = 'default' }: BlogArticleContentProps) {
  const prepared = prepareBlogContentForRender(content)
  if (!prepared.value.trim()) return null

  const sizeClass = size === 'sm' ? 'prose-sm' : 'prose-lg'

  if (prepared.format === 'markdown') {
    return (
      <div className={cn('blog-article-markdown', sizeClass, className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={markdownComponents}
        >
          {prepared.value}
        </ReactMarkdown>
      </div>
    )
  }

  if (!prepared.value.replace(/<[^>]+>/g, '').trim()) return null

  return (
    <div
      className={cn(proseClasses, sizeClass, className)}
      dangerouslySetInnerHTML={{ __html: prepared.value }}
    />
  )
}

export function hasBlogArticleContent(content: string): boolean {
  const prepared = prepareBlogContentForRender(content)
  if (!prepared.value.trim()) return false
  if (prepared.format === 'markdown') return true
  return prepared.value.replace(/<[^>]+>/g, '').trim().length > 0
}
