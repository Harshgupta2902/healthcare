'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  dashboardBlogLink,
  dashboardHomeLink,
  getNavGroupsForRole,
  type DashboardNavGroup,
  type DashboardNavItem,
  type DashboardRole,
  type DashboardSectionId,
} from './dashboard-nav'
import { useDashboardSectionContext } from './dashboard-section-context'

function groupHasActiveSection(group: DashboardNavGroup, activeSection: DashboardSectionId) {
  return group.items.some((item) => item.id === activeSection)
}

export function DashboardSidebar({ role }: { role: DashboardRole }) {
  const pathname = usePathname()
  const { activeSection, setActiveSection } = useDashboardSectionContext()
  const navGroups = getNavGroupsForRole(role)
  const HomeIcon = dashboardHomeLink.icon
  const BlogIcon = dashboardBlogLink.icon
  const isBlogActive = pathname.startsWith('/dashboard/blog')
  const isHomeActive = pathname === '/dashboard' && !isBlogActive && activeSection === 'home'

  return (
    <aside className="liquid-glass-strong hidden h-full min-h-0 w-64 shrink-0 flex-col self-stretch border-r border-white/50 shadow-xl lg:flex dark:border-white/10">
      <nav className="min-h-0 flex-1 overflow-y-auto p-3">
        <button
          type="button"
          onClick={() => setActiveSection('home')}
          className="mb-2 block w-full text-left"
        >
          <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-sans transition-all duration-200',
              isHomeActive
                ? 'admin-nav-active'
                : 'text-lp-on-surface hover:bg-white/45 dark:hover:bg-white/5',
            )}
          >
            <HomeIcon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">{dashboardHomeLink.label}</span>
          </motion.div>
        </button>

        <Link href={dashboardBlogLink.href} className="mb-2 block">
          <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-sans transition-all duration-200',
              isBlogActive
                ? 'admin-nav-active'
                : 'text-lp-on-surface hover:bg-white/45 dark:hover:bg-white/5',
            )}
          >
            <BlogIcon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">{dashboardBlogLink.label}</span>
          </motion.div>
        </Link>

        <div className="space-y-3">
          {navGroups.map((group) => (
            <DashboardNavGroup
              key={group.id}
              group={group}
              activeSection={activeSection}
              onSelect={setActiveSection}
            />
          ))}
        </div>
      </nav>
    </aside>
  )
}

function DashboardNavGroup({
  group,
  activeSection,
  onSelect,
}: {
  group: DashboardNavGroup
  activeSection: DashboardSectionId
  onSelect: (section: DashboardSectionId) => void
}) {
  const isGroupActive = groupHasActiveSection(group, activeSection)

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          'rounded-lg px-2 py-1.5',
          isGroupActive && 'text-lp-brand',
        )}
      >
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-lp-on-surface-variant/90">
          {group.label}
        </span>
      </div>

      <div className="ml-2 space-y-0.5 border-l border-lp-outline-variant/25 pl-2.5">
        {group.items.map((item) => (
          <DashboardNavLink
            key={item.id}
            item={item}
            isActive={activeSection === item.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

function DashboardNavLink({
  item,
  isActive,
  onSelect,
}: {
  item: DashboardNavItem
  isActive: boolean
  onSelect: (section: DashboardSectionId) => void
}) {
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="w-full text-left"
    >
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-sans transition-all duration-200',
          isActive
            ? 'admin-nav-active'
            : 'text-lp-on-surface hover:bg-white/45 dark:hover:bg-white/5',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">{item.label}</span>
      </motion.div>
    </button>
  )
}
