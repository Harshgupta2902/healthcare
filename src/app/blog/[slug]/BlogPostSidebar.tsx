import Image from 'next/image'
import Link from 'next/link'
import { NewsletterSubscribe } from '@/components/NewsletterSubscribe'
import type { BlogPostRow } from '@/features/blog/schema'

type BlogPostSidebarProps = {
  recommended: BlogPostRow[]
}

export function BlogPostSidebar({ recommended }: BlogPostSidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-8 lg:w-1/3">
      {recommended.length > 0 && (
        <div className="flex flex-col gap-4">
          <h4 className="border-b border-lp-outline-variant/30 pb-2 font-sans text-sm font-semibold uppercase tracking-widest text-lp-on-surface">
            Recommended Reading
          </h4>
          <div className="flex flex-col gap-6">
            {recommended.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-4">
                {post.cover_image_url ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                      unoptimized={post.cover_image_url.startsWith('/uploads/')}
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 shrink-0 rounded-lg bg-lp-surface-container-high" />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  {post.category && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-lp-brand">
                      {post.category.name}
                    </span>
                  )}
                  <h5 className="font-sans text-base font-semibold leading-snug text-lp-on-surface transition-colors group-hover:text-lp-brand">
                    {post.title}
                  </h5>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <NewsletterSubscribe
        variant="card"
        inputId="blog-article-newsletter-email"
        title="Weekly Briefing"
        description="Latest clinical research and health insights delivered to your inbox."
      />
    </aside>
  )
}
