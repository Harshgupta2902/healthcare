'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  dashboardMobileNav,
  dashboardMobileNavActive,
  dashboardMobileNavInactive,
} from './dashboard-theme'
import { dashboardBlogLink, getAllNavItemsForRole, type DashboardRole } from './dashboard-nav'
import { useDashboardSectionContext } from './dashboard-section-context'

export function DashboardMobileNav({ role }: { role: DashboardRole }) {
  const pathname = usePathname()
  const { activeSection, setActiveSection } = useDashboardSectionContext()
  const items = getAllNavItemsForRole(role)
  const BlogIcon = dashboardBlogLink.icon
  const isBlogActive = pathname.startsWith('/dashboard/blog')

  return (
    <nav className={dashboardMobileNav}>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <Link
          href={dashboardBlogLink.href}
          className={cn(
            'flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 font-sans text-[10px] font-semibold transition-all',
            isBlogActive ? dashboardMobileNavActive : dashboardMobileNavInactive,
          )}
        >
          <BlogIcon className="h-5 w-5" />
          <span className="max-w-[4.5rem] truncate">{dashboardBlogLink.mobileLabel}</span>
        </Link>

        {items.map((item) => {
          const Icon = item.icon
          const isActive = !isBlogActive && activeSection === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 font-sans text-[10px] font-semibold transition-all',
                isActive ? dashboardMobileNavActive : dashboardMobileNavInactive,
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-[4.5rem] truncate">{item.mobileLabel ?? item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
