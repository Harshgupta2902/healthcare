'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
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
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/features/profile/actions'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Indented sub-item (e.g. Campaigns under Newsletter). */
  nested?: boolean
}

type NavGroup = {
  id: string
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { href: '/application/enter', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/application/enter/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    id: 'people',
    label: 'People & accounts',
    items: [
      { href: '/application/enter/users', label: 'Users', icon: Users },
      { href: '/application/enter/professionals', label: 'Professionals', icon: UserCheck },
    ],
  },
  {
    id: 'consultations',
    label: 'Consultations & revenue',
    items: [
      { href: '/application/enter/booking-orders', label: 'Booking orders', icon: ShoppingBag },
      { href: '/application/enter/payments', label: 'Payments', icon: IndianRupee },
      { href: '/application/enter/appointments', label: 'Appointments', icon: Calendar },
    ],
  },
  {
    id: 'patient-records',
    label: 'Patient records',
    items: [
      { href: '/application/enter/medical-history', label: 'Medical history', icon: FileText },
      { href: '/application/enter/medications', label: 'Medications', icon: Pill },
      { href: '/application/enter/documents', label: 'Documents', icon: FileCheck },
      { href: '/application/enter/insurance', label: 'Insurance', icon: Shield },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & content',
    items: [
      { href: '/application/enter/enquiries', label: 'Enquiries', icon: MessageSquare },
      { href: '/application/enter/newsletter', label: 'Newsletter', icon: Mail },
      {
        href: '/application/enter/newsletter/campaigns',
        label: 'Campaigns',
        icon: Send,
        nested: true,
      },
      { href: '/application/enter/blog', label: 'Blog', icon: Newspaper },
    ],
  },
]

const settingsItem: NavItem = {
  href: '/application/enter/settings',
  label: 'Settings',
  icon: Settings,
}

const allNavItems: NavItem[] = [
  ...navGroups.flatMap((group) => group.items),
  settingsItem,
]

function groupHasActiveItem(group: NavGroup, pathname: string) {
  return group.items.some((item) => isNavItemActive(pathname, item.href))
}

function buildInitialOpenGroups(pathname: string): Record<string, boolean> {
  const open: Record<string, boolean> = {}
  for (const group of navGroups) {
    if (groupHasActiveItem(group, pathname)) {
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
        if (groupHasActiveItem(group, pathname)) {
          next[group.id] = true
        }
      }
      return next
    })
  }, [pathname])

  return (
    <>
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="liquid-glass-strong hidden h-full min-h-0 w-64 shrink-0 flex-col self-stretch border-r border-white/50 shadow-xl lg:flex dark:border-white/10"
      >
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
          <SidebarNavLink item={settingsItem} pathname={pathname} />
          <SidebarLogoutButton />
        </div>
      </motion.aside>

      <nav className="liquid-glass-strong fixed inset-x-0 bottom-0 z-50 border-t border-white/50 px-3 py-2 shadow-[0_-12px_30px_rgba(0,89,187,0.12)] backdrop-blur-xl lg:hidden dark:border-white/10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {allNavItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-semibold transition-all',
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
  const isGroupActive = groupHasActiveItem(group, pathname)

  return (
    <AccordionItem value={group.id} className="border-0">
      <AccordionTrigger
        className={cn(
          'cursor-pointer rounded-xl px-3 py-2.5 font-sans hover:no-underline',
          'hover:bg-white/45 dark:hover:bg-white/5',
          isGroupActive && 'text-lp-brand',
          '[&>svg]:text-lp-on-surface-variant',
        )}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-lp-on-surface-variant">
          {group.label}
        </span>
      </AccordionTrigger>

      <AccordionContent className="pb-1">
        <div className="space-y-0.5">
          {group.items.map((item) => (
            <SidebarNavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

function SidebarNavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = isNavItemActive(pathname, item.href)
  const Icon = item.icon

  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'flex items-center gap-3 rounded-xl py-2.5 font-sans transition-all duration-200',
          item.nested ? 'ml-3 border-l-2 border-lp-outline-variant/25 pl-5 pr-3' : 'px-3',
          isActive
            ? 'admin-nav-active'
            : 'text-lp-on-surface hover:bg-white/45 dark:hover:bg-white/5',
        )}
      >
        <Icon className={cn('shrink-0', item.nested ? 'h-4 w-4' : 'h-5 w-5')} />
        <span className={cn('font-medium', item.nested && 'text-sm')}>{item.label}</span>
      </motion.div>
    </Link>
  )
}

function SidebarLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) console.error(error)
    } catch (e) {
      console.error(e)
    }
    try {
      await signOut()
    } catch {
      /* noop */
    }
    router.refresh()
    router.replace('/')
  }

  return (
    <motion.button
      type="button"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-sans font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <LogOut className="h-5 w-5 shrink-0" />
      <span>Logout</span>
    </motion.button>
  )
}

function isNavItemActive(pathname: string, href: string) {
  const matches = allNavItems.filter(
    (n) => pathname === n.href || (n.href !== '/application/enter' && pathname.startsWith(n.href + '/')),
  )
  const longest = matches.sort((a, b) => b.href.length - a.href.length)[0]

  return longest ? longest.href === href : href === '/application/enter' && pathname === '/application/enter'
}
