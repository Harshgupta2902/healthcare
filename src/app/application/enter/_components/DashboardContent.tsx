'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Mail, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { motion } from 'framer-motion'
import { AdminPageHeader } from './AdminPageHeader'
import { adminTheme } from './admin-theme'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalUsers: number
  clientUsers: number
  totalProfessionals: number
  verifiedProfessionals: number
  totalAppointments: number
  totalEnquiries: number
  newsletterSubscribers: number
  newsletterActive: number
  newsletterResubscribed: number
  newsletterUnsubscribed: number
}

interface DashboardContentProps {
  stats: DashboardStats
  recentAppointments: any[]
  recentUsers: any[]
  loadError?: string | null
}

export function DashboardContent({ stats, recentAppointments, recentUsers, loadError }: DashboardContentProps) {
  const statCards: {
    title: string
    value: number
    icon: typeof Users
    accent: string
    breakdown?: { label: string; value: number }[]
  }[] = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      accent: 'from-lp-brand to-lp-brand-bright',
      breakdown: [
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Users', value: stats.clientUsers },
        { label: 'Professionals', value: stats.totalProfessionals },
        { label: 'Verified Professionals', value: stats.verifiedProfessionals },
      ],
    },
    {
      title: 'Newsletter Subscribers',
      value: stats.newsletterSubscribers,
      icon: Mail,
      accent: 'from-lp-primary-container to-lp-brand',
      breakdown: [
        { label: 'Total Subscribers', value: stats.newsletterSubscribers },
        { label: 'Subscribed', value: stats.newsletterActive },
        { label: 'Unsubscribed', value: stats.newsletterUnsubscribed },
        { label: 'Resubscribed', value: stats.newsletterResubscribed },
      ],
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      accent: 'from-lp-brand-bright to-lp-surface-variant',
    },
    {
      title: 'Total Enquiries',
      value: stats.totalEnquiries,
      icon: MessageSquare,
      accent: 'from-lp-on-surface-variant to-lp-brand',
    },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      {loadError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {loadError}
        </p>
      )}

      <AdminPageHeader title="Dashboard Overview" />

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="liquid-glass liquid-glass-interactive overflow-hidden rounded-2xl border-0 shadow-none">
                <CardHeader className="pt-4 pb-2">
                  <div
                    className={cn(
                      'mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br sm:h-12 sm:w-12',
                      stat.accent
                    )}
                  >
                    <Icon className="h-5 w-5 text-lp-on-brand sm:h-6 sm:w-6" />
                  </div>
                  {!stat.breakdown && (
                    <CardDescription className="text-lp-on-surface-variant">{stat.title}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {!stat.breakdown && (
                    <CardTitle className="font-heading text-2xl font-bold text-lp-on-surface sm:text-3xl">
                      {stat.value.toLocaleString()}
                    </CardTitle>
                  )}
                  {stat.breakdown && stat.breakdown.length > 0 && (
                    <div className="space-y-1.5 border-t border-lp-outline-variant/25 pt-3">
                      {stat.breakdown.map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-xs">
                          <span className="text-lp-on-surface-variant">{row.label}</span>
                          <span className="font-semibold tabular-nums text-lp-on-surface">
                            {row.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="liquid-glass overflow-hidden rounded-2xl border-0 shadow-none">
            <CardHeader className="px-4 pt-4 sm:px-6">
              <CardTitle className="font-heading text-base text-lp-on-surface sm:text-lg">
                Recent Appointments
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-lp-on-surface-variant">
                Registered bookings and guest consultation requests
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3 sm:hidden">
                {recentAppointments.length === 0 ? (
                  <div className={adminTheme.emptyState}>No appointments found</div>
                ) : (
                  recentAppointments.map((appointment: any) => (
                    <div
                      key={`${appointment.kind ?? 'registered'}-${appointment.id}`}
                      className={adminTheme.mobileCard}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold text-lp-on-surface">
                          {appointment.client?.name || 'N/A'}
                        </p>
                        {appointment.kind === 'guest' && (
                          <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                            Guest
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-lp-on-surface-variant">
                        With{' '}
                        <span className="font-semibold text-lp-on-surface">
                          {appointment.professional?.name || '—'}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-lp-on-surface-variant">
                        {format(new Date(appointment.start_time), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <Table className="min-w-[560px]">
                  <TableHeader>
                    <TableRow className={adminTheme.tableHeader}>
                      <TableHead>Name</TableHead>
                      <TableHead>With</TableHead>
                      <TableHead>When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-lp-on-surface-variant">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentAppointments.map((appointment: any) => (
                        <TableRow
                          key={`${appointment.kind ?? 'registered'}-${appointment.id}`}
                          className={adminTheme.tableRowHover}
                        >
                          <TableCell className="font-medium">
                            <span>{appointment.client?.name || 'N/A'}</span>
                            {appointment.kind === 'guest' && (
                              <Badge variant="outline" className="ml-2 text-xs capitalize">
                                Guest
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{appointment.professional?.name || '—'}</TableCell>
                          <TableCell>
                            {format(new Date(appointment.start_time), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="liquid-glass overflow-hidden rounded-2xl border-0 shadow-none">
            <CardHeader className="px-4 pt-4 sm:px-6">
              <CardTitle className="font-heading text-base text-lp-on-surface sm:text-lg">
                Recent User Registrations
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-lp-on-surface-variant">
                Newly registered users
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3 sm:hidden">
                {recentUsers.length === 0 ? (
                  <div className={adminTheme.emptyState}>No users found</div>
                ) : (
                  recentUsers.map((user: any) => (
                    <div key={user.id} className={adminTheme.mobileCard}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold text-lp-on-surface">
                          {user.name || 'N/A'}
                        </p>
                        <Badge
                          variant={
                            user.role === 'admin'
                              ? 'default'
                              : user.role === 'professional'
                                ? 'default'
                                : 'secondary'
                          }
                          className="shrink-0 text-[10px] capitalize"
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="mt-2 break-all text-xs text-lp-on-surface-variant">{user.email}</p>
                      <p className="mt-1 text-xs text-lp-on-surface-variant">
                        Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow className={adminTheme.tableHeader}>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-lp-on-surface-variant">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentUsers.map((user: any) => (
                        <TableRow key={user.id} className={adminTheme.tableRowHover}>
                          <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === 'admin'
                                  ? 'default'
                                  : user.role === 'professional'
                                    ? 'default'
                                    : 'secondary'
                              }
                              className="capitalize"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(user.created_at), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
