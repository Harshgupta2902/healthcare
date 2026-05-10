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
    <div className="space-y-6">
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to the healthcare admin dashboard
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="border-teal-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden">
                <CardHeader className="pt-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {!stat.breakdown && <CardDescription className="text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardDescription>}
                </CardHeader>
                <CardContent className="pt-0">
                  {!stat.breakdown &&
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
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
          <Card className="border-teal-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
            <CardHeader className="pt-4">
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Registered bookings and guest consultation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
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
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-teal-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
            <CardHeader className="pt-4">
              <CardTitle>Recent User Registrations</CardTitle>
              <CardDescription>Newly registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
