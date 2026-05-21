'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/features/profile/actions'

const navItems = [
  { href: '/application/enter', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/application/enter/notifications', label: 'Notifications', icon: Bell },
  { href: '/application/enter/users', label: 'Users', icon: Users },
  { href: '/application/enter/professionals', label: 'Professionals', icon: UserCheck },
  { href: '/application/enter/appointments', label: 'Appointments', icon: Calendar },
  { href: '/application/enter/medical-history', label: 'Medical History', icon: FileText },
  { href: '/application/enter/medications', label: 'Medications', icon: Pill },
  { href: '/application/enter/documents', label: 'Documents', icon: FileCheck },
  { href: '/application/enter/insurance', label: 'Insurance', icon: Shield },
  { href: '/application/enter/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/application/enter/newsletter/campaigns', label: 'Campaigns', icon: Send },
  { href: '/application/enter/enquiries', label: 'Enquiries', icon: MessageSquare },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="liquid-glass-strong hidden h-full min-h-0 w-64 shrink-0 flex-col self-stretch border-r border-white/50 shadow-xl lg:flex dark:border-white/10"
      >
        <div className="border-b border-lp-outline-variant/25 p-6">
          <h1 className="font-heading text-2xl font-bold bg-gradient-to-r from-lp-brand to-lp-brand-bright bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="mt-1 font-sans text-sm text-lp-on-surface-variant">Healthcare Dashboard</p>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive = getIsActive(pathname, item.href)
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 font-sans transition-all duration-200',
                    isActive
                      ? 'admin-nav-active'
                      : 'text-lp-on-surface hover:bg-white/45 dark:hover:bg-white/5'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-lp-outline-variant/25 bg-lp-surface-container-lowest/80 p-4 dark:bg-lp-primary-container/80">
          <SidebarLogoutButton />
        </div>
      </motion.aside>

      <nav className="liquid-glass-strong fixed inset-x-0 bottom-0 z-50 border-t border-white/50 px-3 py-2 shadow-[0_-12px_30px_rgba(0,89,187,0.12)] backdrop-blur-xl lg:hidden dark:border-white/10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = getIsActive(pathname, item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-semibold transition-all',
                  isActive
                    ? 'admin-nav-active shadow-lg'
                    : 'text-lp-on-surface-variant hover:bg-white/40 dark:hover:bg-white/5'
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
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-sans font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <LogOut className="h-5 w-5 shrink-0" />
      <span>Logout</span>
    </motion.button>
  )
}

function getIsActive(pathname: string, href: string) {
  const matches = navItems.filter(
    (n) => pathname === n.href || (n.href !== '/application/enter' && pathname.startsWith(n.href + '/'))
  )
  const longest = matches.sort((a, b) => b.href.length - a.href.length)[0]

  return longest ? longest.href === href : href === '/application/enter' && pathname === '/application/enter'
}
