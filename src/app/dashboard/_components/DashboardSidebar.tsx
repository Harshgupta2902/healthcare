'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import {
  dashboardBlogLink,
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

function buildInitialOpenGroups(role: DashboardRole, activeSection: DashboardSectionId) {
  const open: Record<string, boolean> = {}
  for (const group of getNavGroupsForRole(role)) {
    if (groupHasActiveSection(group, activeSection)) {
      open[group.id] = true
    }
  }
  return open
}

export function DashboardSidebar({ role }: { role: DashboardRole }) {
  const pathname = usePathname()
  const { activeSection, setActiveSection } = useDashboardSectionContext()
  const navGroups = getNavGroupsForRole(role)
  const BlogIcon = dashboardBlogLink.icon
  const isBlogActive = pathname.startsWith('/dashboard/blog')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    buildInitialOpenGroups(role, activeSection),
  )

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      for (const group of navGroups) {
        if (groupHasActiveSection(group, activeSection)) {
          next[group.id] = true
        }
      }
      return next
    })
  }, [activeSection, navGroups])

  return (
    <aside className="liquid-glass-strong hidden h-full min-h-0 w-64 shrink-0 flex-col self-stretch border-r border-white/50 shadow-xl lg:flex dark:border-white/10">
      <div className="border-b border-lp-outline-variant/25 p-6">
        <h1 className="font-heading text-2xl font-bold bg-gradient-to-r from-lp-brand to-lp-brand-bright bg-clip-text text-transparent">
          {role === 'professional' ? 'Pro Dashboard' : 'My Health'}
        </h1>
        <p className="mt-1 font-sans text-sm text-lp-on-surface-variant">
          {role === 'professional' ? 'Practice & consultations' : 'Patient medical hub'}
        </p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-3">
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

        <Accordion
          type="multiple"
          value={navGroups.filter((group) => openGroups[group.id]).map((group) => group.id)}
          onValueChange={(values) => {
            const next: Record<string, boolean> = {}
            for (const group of navGroups) {
              next[group.id] = values.includes(group.id)
            }
            setOpenGroups(next)
          }}
          className="space-y-1"
        >
          {navGroups.map((group) => (
            <DashboardNavGroup
              key={group.id}
              group={group}
              activeSection={activeSection}
              onSelect={setActiveSection}
            />
          ))}
        </Accordion>
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
    <AccordionItem value={group.id} className="border-0">
      <AccordionTrigger
        className={cn(
          'cursor-pointer rounded-lg px-2 py-1.5 font-sans hover:no-underline',
          'hover:bg-white/45 dark:hover:bg-white/5',
          isGroupActive && 'text-lp-brand',
          '[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-lp-on-surface-variant/60',
        )}
      >
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-lp-on-surface-variant/90">
          {group.label}
        </span>
      </AccordionTrigger>

      <AccordionContent className="pb-1 pt-0.5">
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
      </AccordionContent>
    </AccordionItem>
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
