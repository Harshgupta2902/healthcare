'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  FileCheck,
  Shield,
  Mail,
  Send,
  Bell,
  MessageSquare,
  LogOut,
  Newspaper,
  Settings,
  ShoppingBag,
  IndianRupee,
  MessageCircle,
  Tags,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAndRedirectHome } from '@/features/auth/logout'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type NavSubPage = {
  href: string
  label: string
  icon: LucideIcon
}

type NavPage = {
  href: string
  label: string
  icon: LucideIcon
  children?: NavSubPage[]
}

type NavGroup = {
  id: string
  label: string
  pages: NavPage[]
}

const navGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    pages: [
      { href: '/application/enter', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/application/enter/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    id: 'people',
    label: 'People & accounts',
    pages: [
      { href: '/application/enter/users', label: 'Users', icon: Users },
      { href: '/application/enter/professionals', label: 'Professionals', icon: UserCheck },
    ],
  },
  {
    id: 'consultations',
    label: 'Consultations & revenue',
    pages: [
      { href: '/application/enter/booking-orders', label: 'Booking orders', icon: ShoppingBag },
      { href: '/application/enter/payments', label: 'Payments', icon: IndianRupee },
      { href: '/application/enter/appointments', label: 'Appointments', icon: Calendar },
    ],
  },
  {
    id: 'patient-records',
    label: 'Patient records',
    pages: [
      { href: '/application/enter/medical-history', label: 'Medical history', icon: FileText },
      { href: '/application/enter/medications', label: 'Medications', icon: Pill },
      { href: '/application/enter/documents', label: 'Documents', icon: FileCheck },
      { href: '/application/enter/insurance', label: 'Insurance', icon: Shield },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & content',
    pages: [
      { href: '/application/enter/enquiries', label: 'Enquiries', icon: MessageSquare },
      {
        href: '/application/enter/newsletter',
        label: 'Newsletter',
        icon: Mail,
        children: [
          { href: '/application/enter/newsletter/campaigns', label: 'Campaigns', icon: Send },
        ],
      },
      {
        href: '/application/enter/blog',
        label: 'Blog',
        icon: Newspaper,
        children: [
          { href: '/application/enter/blog', label: 'Posts', icon: FileText },
          { href: '/application/enter/blog/comments', label: 'Comments', icon: MessageCircle },
          { href: '/application/enter/blog/categories', label: 'Categories', icon: Tags },
        ],
      },
    ],
  },
]

const settingsPage: NavPage = {
  href: '/application/enter/settings',
  label: 'Settings',
  icon: Settings,
}

const allNavHrefs: { href: string }[] = [
  ...navGroups.flatMap((group) =>
    group.pages.flatMap((page) => [
      { href: page.href },
      ...(page.children?.map((child) => ({ href: child.href })) ?? []),
    ]),
  ),
  { href: settingsPage.href },
]

const mobileNavItems = [
  ...navGroups.flatMap((group) =>
    group.pages.flatMap((page) => [
      { href: page.href, label: page.label, icon: page.icon },
      ...(page.children?.map((child) => ({
        href: child.href,
        label: child.label,
        icon: child.icon,
      })) ?? []),
    ]),
  ),
  { href: settingsPage.href, label: settingsPage.label, icon: settingsPage.icon },
]

function groupHasActivePage(group: NavGroup, pathname: string) {
  return group.pages.some(
    (page) =>
      isNavItemActive(pathname, page.href) ||
      page.children?.some((child) => isNavItemActive(pathname, child.href)),
  )
}

function buildInitialOpenGroups(pathname: string): Record<string, boolean> {
  const open: Record<string, boolean> = {}
  for (const group of navGroups) {
    if (groupHasActivePage(group, pathname)) {
      open[group.id] = true
    }
  }
  return open
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    buildInitialOpenGroups(pathname),
  )

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      for (const group of navGroups) {
        if (groupHasActivePage(group, pathname)) {
          next[group.id] = true
        }
      }
      return next
    })
  }, [pathname])

  return (
    <>
      <aside className="liquid-glass-strong hidden h-full min-h-0 w-64 shrink-0 flex-col self-stretch border-r border-white/50 shadow-xl lg:flex dark:border-white/10">
        <div className="border-b border-lp-outline-variant/25 p-6">
          <Link
            href="/application/enter"
            className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-lp-brand/40"
          >
            <h1 className="font-heading text-2xl font-bold bg-gradient-to-r from-lp-brand to-lp-brand-bright bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="mt-1 font-sans text-sm text-lp-on-surface-variant">Healthcare Dashboard</p>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto p-3">
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
              <SidebarNavGroup key={group.id} group={group} pathname={pathname} />
            ))}
          </Accordion>
        </nav>

        <div className="shrink-0 space-y-1 border-t border-lp-outline-variant/25 bg-lp-surface-container-lowest/80 p-4 dark:bg-lp-primary-container/80">
          <SidebarPageLink page={settingsPage} pathname={pathname} />
          <SidebarLogoutButton />
        </div>
      </aside>

      <nav className="liquid-glass-strong fixed inset-x-0 bottom-0 z-50 border-t border-white/50 px-3 py-2 shadow-[0_-12px_30px_rgba(0,89,187,0.12)] backdrop-blur-xl lg:hidden dark:border-white/10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {mobileNavItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href)
            const Icon = item.icon

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  'flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 font-sans text-[10px] font-semibold transition-all',
                  isActive
                    ? 'admin-nav-active shadow-lg'
                    : 'text-lp-on-surface-variant hover:bg-white/40 dark:hover:bg-white/5',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-[4.5rem] truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

function SidebarNavGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const isGroupActive = groupHasActivePage(group, pathname)

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
          {group.pages.map((page) => (
            <SidebarPageBlock key={page.href} page={page} pathname={pathname} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

function SidebarPageBlock({ page, pathname }: { page: NavPage; pathname: string }) {
  const hasChildren = Boolean(page.children?.length)

  if (!hasChildren) {
    return <SidebarPageLink page={page} pathname={pathname} />
  }

  const hasActiveChild = page.children!.some((child) => isNavItemActive(pathname, child.href))

  return (
    <div className="space-y-0.5">
      <SidebarPageLink page={page} pathname={pathname} isParentActive={hasActiveChild} />
      <div className="ml-[1.125rem] space-y-0.5 border-l border-lp-outline-variant/20 pl-2.5">
        {page.children!.map((child) => (
          <SidebarSubPageLink key={child.href} subPage={child} pathname={pathname} />
        ))}
      </div>
    </div>
  )
}

function SidebarPageLink({
  page,
  pathname,
  isParentActive = false,
}: {
  page: NavPage
  pathname: string
  isParentActive?: boolean
}) {
  const isActive = isNavItemActive(pathname, page.href) && !isParentActive
  const Icon = page.icon

  return (
    <Link href={page.href}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-sans transition-all duration-200',
          isActive
            ? 'admin-nav-active'
            : isParentActive
              ? 'bg-lp-brand/8 text-lp-brand'
              : 'text-lp-on-surface hover:bg-white/45 dark:hover:bg-white/5',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">{page.label}</span>
      </motion.div>
    </Link>
  )
}

function SidebarSubPageLink({
  subPage,
  pathname,
}: {
  subPage: NavSubPage
  pathname: string
}) {
  const isActive = isNavItemActive(pathname, subPage.href)
  const Icon = subPage.icon

  return (
    <Link href={subPage.href}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-1.5 font-sans transition-all duration-200',
          isActive
            ? 'admin-nav-active'
            : 'text-lp-on-surface-variant hover:bg-white/45 hover:text-lp-on-surface dark:hover:bg-white/5',
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span className="text-[13px] font-medium">{subPage.label}</span>
      </motion.div>
    </Link>
  )
}

function SidebarLogoutButton() {
  const handleLogout = () => {
    void logoutAndRedirectHome()
  }

  return (
    <motion.button
      type="button"
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleLogout}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-sans text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span>Logout</span>
    </motion.button>
  )
}

function isNavItemActive(pathname: string, href: string) {
  const matches = allNavHrefs.filter(
    (n) =>
      pathname === n.href ||
      (n.href !== '/application/enter' && pathname.startsWith(n.href + '/')),
  )
  const longest = matches.sort((a, b) => b.href.length - a.href.length)[0]

  return longest ? longest.href === href : href === '/application/enter' && pathname === '/application/enter'
}
