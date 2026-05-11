'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
        className="hidden lg:block w-64 shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-teal-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="p-6 border-b border-teal-200/50 dark:border-gray-700/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Healthcare Dashboard
          </p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = getIsActive(pathname, item.href)
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </motion.aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-teal-100 bg-white/95 px-3 py-2 shadow-[0_-12px_30px_rgba(15,118,110,0.12)] backdrop-blur-md dark:border-gray-700/70 dark:bg-gray-900/95 lg:hidden">
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
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                    : 'text-gray-600 hover:bg-teal-50 dark:text-gray-300 dark:hover:bg-gray-800'
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

function getIsActive(pathname: string, href: string) {
  const matches = navItems.filter(
    (n) => pathname === n.href || (n.href !== '/application/enter' && pathname.startsWith(n.href + '/'))
  )
  const longest = matches.sort((a, b) => b.href.length - a.href.length)[0]

  return longest ? longest.href === href : href === '/application/enter' && pathname === '/application/enter'
}
