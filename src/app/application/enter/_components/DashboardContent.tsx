'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Calendar, FileCheck, Mail } from 'lucide-react'
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
  totalProfessionals: number
  totalAppointments: number
  totalDocuments: number
  newsletterSubscribers: number
}

interface DashboardContentProps {
  stats: DashboardStats
  recentAppointments: any[]
  recentUsers: any[]
  loadError?: string | null
}

export function DashboardContent({ stats, recentAppointments, recentUsers, loadError }: DashboardContentProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Professionals',
      value: stats.totalProfessionals,
      icon: UserCheck,
      color: 'from-teal-500 to-emerald-500',
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: FileCheck,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Newsletter Subscribers',
      value: stats.newsletterSubscribers,
      icon: Mail,
      color: 'from-indigo-500 to-blue-500',
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
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </CardTitle>
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
              <CardDescription>Latest appointment bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Professional</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No appointments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentAppointments.map((appointment: any) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.client?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {appointment.professional?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(appointment.start_time), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              appointment.status === 'completed'
                                ? 'default'
                                : appointment.status === 'confirmed'
                                ? 'default'
                                : appointment.status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {appointment.status}
                          </Badge>
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
