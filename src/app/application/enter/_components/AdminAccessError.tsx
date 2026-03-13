'use client'

import { AlertCircle, LogIn, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface AdminAccessErrorProps {
  title: string
  message: string
  isAuthenticated: boolean
  userRole?: string
}

export function AdminAccessError({ title, message, isAuthenticated, userRole }: AdminAccessErrorProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <Card className="border-red-200 dark:border-red-900/50 shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              {isAuthenticated ? (
                <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl text-red-600 dark:text-red-400">{title}</CardTitle>
          <CardDescription className="mt-2 text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userRole && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your current role: <span className="font-semibold capitalize">{userRole}</span>
              </p>
            </div>
          )}
          <div className="flex gap-3">
            {!isAuthenticated ? (
              <Button
                onClick={() => router.push('/login')}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Go to Login
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                Go to Home
              </Button>
            )}
            <Button
              onClick={() => router.refresh()}
              variant="outline"
              className="rounded-xl"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
