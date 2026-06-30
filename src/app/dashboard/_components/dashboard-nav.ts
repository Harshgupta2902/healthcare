import {
  User,
  Heart,
  Pill,
  FileText,
  Shield,
  Calendar,
  Clock,
  IndianRupee,
  GraduationCap,
  MessageSquare,
  Users,
  LayoutDashboard,
  PenLine,
  type LucideIcon,
} from 'lucide-react'

export type DashboardRole = 'client' | 'professional'

export type DashboardSectionId =
  | 'home'
  | 'profile'
  | 'history'
  | 'medications'
  | 'documents'
  | 'insurance'
  | 'appointments'
  | 'orders'
  | 'credentials'
  | 'consultations'
  | 'calendar'
  | 'payments'
  | 'clients'

export type DashboardNavItem = {
  id: DashboardSectionId
  label: string
  mobileLabel?: string
  icon: LucideIcon
  roles: DashboardRole[]
}

export type DashboardNavGroup = {
  id: string
  label: string
  items: DashboardNavItem[]
}

const clientHealthRecords: DashboardNavItem[] = [
  { id: 'history', label: 'Medical history', mobileLabel: 'History', icon: Heart, roles: ['client'] },
  { id: 'medications', label: 'Medications', mobileLabel: 'Meds', icon: Pill, roles: ['client'] },
  { id: 'documents', label: 'Documents', mobileLabel: 'Docs', icon: FileText, roles: ['client'] },
  { id: 'insurance', label: 'Insurance', icon: Shield, roles: ['client'] },
]

const clientBookings: DashboardNavItem[] = [
  { id: 'appointments', label: 'Appointments', mobileLabel: 'Requests', icon: Calendar, roles: ['client'] },
  { id: 'orders', label: 'Orders', icon: IndianRupee, roles: ['client'] },
]

const professionalPractice: DashboardNavItem[] = [
  { id: 'credentials', label: 'Credentials', mobileLabel: 'Creds', icon: GraduationCap, roles: ['professional'] },
  { id: 'consultations', label: 'Consultations', mobileLabel: 'Requests', icon: MessageSquare, roles: ['professional'] },
  { id: 'calendar', label: 'Availability', mobileLabel: 'Hours', icon: Clock, roles: ['professional'] },
]

const professionalBusiness: DashboardNavItem[] = [
  { id: 'payments', label: 'Payments', icon: IndianRupee, roles: ['professional'] },
  { id: 'clients', label: 'Clients', icon: Users, roles: ['professional'] },
]

export const clientNavGroups: DashboardNavGroup[] = [
  {
    id: 'bookings',
    label: 'Bookings',
    items: clientBookings,
  },
  {
    id: 'health-records',
    label: 'Health records',
    items: clientHealthRecords,
  },
  {
    id: 'account',
    label: 'Account',
    items: [{ id: 'profile', label: 'Profile', icon: User, roles: ['client'] }],
  },
]

export const professionalNavGroups: DashboardNavGroup[] = [
  {
    id: 'business',
    label: 'Business',
    items: professionalBusiness,
  },
  {
    id: 'practice',
    label: 'Practice',
    items: professionalPractice,
  },
  {
    id: 'account',
    label: 'Account',
    items: [{ id: 'profile', label: 'Profile', icon: User, roles: ['professional'] }],
  },

]

export const dashboardHomeLink = {
  href: '/dashboard',
  label: 'Dashboard',
  mobileLabel: 'Home',
  icon: LayoutDashboard,
} as const

export const dashboardBlogLink = {
  href: '/dashboard/blog',
  label: 'Write a blog',
  mobileLabel: 'Blog',
  icon: PenLine,
} as const

export function getNavGroupsForRole(role: DashboardRole): DashboardNavGroup[] {
  return role === 'professional' ? professionalNavGroups : clientNavGroups
}

export function getAllNavItemsForRole(role: DashboardRole): DashboardNavItem[] {
  return getNavGroupsForRole(role).flatMap((group) => group.items)
}

export function isSectionAllowedForRole(section: string, role: DashboardRole): section is DashboardSectionId {
  return getAllNavItemsForRole(role).some((item) => item.id === section)
}

export function getDefaultSectionForRole(_role: DashboardRole): DashboardSectionId {
  return 'home'
}

export function getNavItemForSection(role: DashboardRole, section: DashboardSectionId): DashboardNavItem | undefined {
  return getAllNavItemsForRole(role).find((item) => item.id === section)
}

export function normalizeDashboardSection(hash: string, role: DashboardRole): DashboardSectionId {
  const raw = hash.replace(/^#/, '').trim()
  if (!raw || raw === 'home') return getDefaultSectionForRole(role)
  if (role === 'professional' && (raw === 'availability' || raw === 'schedule')) {
    return raw === 'schedule' ? 'home' : 'calendar'
  }
  if (isSectionAllowedForRole(raw, role)) return raw
  return getDefaultSectionForRole(role)
}
