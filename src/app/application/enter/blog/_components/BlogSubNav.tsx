'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/application/enter/blog', label: 'Posts', exact: true },
  { href: '/application/enter/blog/comments', label: 'Comments', exact: false },
  { href: '/application/enter/blog/categories', label: 'Categories', exact: false },
]

export function BlogSubNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition-all',
              active
                ? 'admin-nav-active shadow-md'
                : 'text-lp-on-surface-variant hover:bg-white/45 dark:hover:bg-white/5'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
