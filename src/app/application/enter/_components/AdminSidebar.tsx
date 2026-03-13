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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/application/enter', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/application/enter/users', label: 'Users', icon: Users },
  { href: '/application/enter/professionals', label: 'Professionals', icon: UserCheck },
  { href: '/application/enter/appointments', label: 'Appointments', icon: Calendar },
  { href: '/application/enter/medical-history', label: 'Medical History', icon: FileText },
  { href: '/application/enter/medications', label: 'Medications', icon: Pill },
  { href: '/application/enter/documents', label: 'Documents', icon: FileCheck },
  { href: '/application/enter/insurance', label: 'Insurance', icon: Shield },
  { href: '/application/enter/newsletter', label: 'Newsletter', icon: Mail },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-teal-200/50 dark:border-gray-700/50 shadow-lg"
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
          const isActive = pathname === item.href || (item.href !== '/application/enter' && pathname.startsWith(item.href))
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
  )
}
