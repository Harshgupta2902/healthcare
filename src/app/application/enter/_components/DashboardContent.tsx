'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Calendar, FileCheck, Mail, MessageSquare } from 'lucide-react'
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
    color: string
    breakdown?: { label: string; value: number }[]
  }[] = [
      {
        title: 'Total Users',
        value: stats.totalUsers,
        icon: Users,
        color: 'from-blue-500 to-cyan-500',
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
        color: 'from-indigo-500 to-blue-500',
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
        color: 'from-purple-500 to-pink-500',
      },
      {
        title: 'Total Enquiries',
        value: stats.totalEnquiries,
        icon: MessageSquare,
        color: 'from-orange-500 to-red-500',
      },

    ]

  return (
    <div className="space-y-5 sm:space-y-6">
      {loadError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {loadError}
        </p>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Welcome to the healthcare admin dashboard
        </p>
      </motion.div>

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
              <Card className="border-teal-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden">
                <CardHeader className="pt-4 pb-2">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {!stat.breakdown && <CardDescription className="text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardDescription>}
                </CardHeader>
                <CardContent className="pt-0">
                  {!stat.breakdown &&
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </CardTitle>
                  }
                  {stat.breakdown && stat.breakdown.length > 0 && (
                    <div className="pt-3 border-t border-teal-100 dark:border-gray-800 space-y-1.5">
                      {stat.breakdown.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
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
          <Card className="border-teal-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="px-4 pt-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Recent Appointments</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Registered bookings and guest consultation requests
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3 sm:hidden">
                {recentAppointments.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-gray-500">
                    No appointments found
                  </div>
                ) : (
                  recentAppointments.map((appointment: any) => (
                    <div
                      key={`${appointment.kind ?? 'registered'}-${appointment.id}`}
                      className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                          {appointment.client?.name || 'N/A'}
                        </p>
                        {appointment.kind === 'guest' && (
                          <Badge variant="outline" className="shrink-0 capitalize text-[10px]">
                            Guest
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        With <span className="font-semibold text-gray-700">{appointment.professional?.name || '—'}</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {format(new Date(appointment.start_time), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <Table className="min-w-[560px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>With</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        No appointments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentAppointments.map((appointment: any) => (
                      <TableRow key={`${appointment.kind ?? 'registered'}-${appointment.id}`}>
                        <TableCell className="font-medium">
                          <span>{appointment.client?.name || 'N/A'}</span>
                          {appointment.kind === 'guest' && (
                            <Badge variant="outline" className="ml-2 capitalize text-xs">
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
          <Card className="border-teal-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="px-4 pt-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Recent User Registrations</CardTitle>
              <CardDescription className="text-sm leading-relaxed">Newly registered users</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3 sm:hidden">
                {recentUsers.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-gray-500">
                    No users found
                  </div>
                ) : (
                  recentUsers.map((user: any) => (
                    <div key={user.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{user.name || 'N/A'}</p>
                        <Badge
                          variant={
                            user.role === 'admin'
                              ? 'default'
                              : user.role === 'professional'
                                ? 'default'
                                : 'secondary'
                          }
                          className="shrink-0 capitalize text-[10px]"
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="mt-2 break-all text-xs text-gray-500">{user.email}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentUsers.map((user: any) => (
                      <TableRow key={user.id}>
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
                        <TableCell>
                          {format(new Date(user.created_at), 'MMM dd, yyyy')}
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
      </div>
    </div>
  )
}
