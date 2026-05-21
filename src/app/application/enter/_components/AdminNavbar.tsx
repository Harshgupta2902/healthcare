'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Search, Bell, LogOut, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut, uploadProfileImage } from '@/features/profile/actions'
import { toast } from 'sonner'
import { useRef } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { adminTheme } from './admin-theme'

interface AdminNavbarProps {
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
  unreadNotificationCount?: number
}

export function AdminNavbar({ user, unreadNotificationCount = 0 }: AdminNavbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadProfileImage(formData)
      if (result.success) {
        toast.success('Profile image updated successfully')
        const supabase = createClient()
        await supabase.auth.refreshSession()
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to upload image')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD'

  const email = user.email?.trim() ?? ''
  const name = user.name?.trim() ?? ''
  const showNameLine = Boolean(name && email && name.toLowerCase() !== email.toLowerCase())

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="liquid-glass-strong h-16 shrink-0 border-b border-white/50 shadow-sm dark:border-white/10"
    >
      <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-6">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <div className="relative">
            <Search className={cn('absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2', adminTheme.iconMuted)} />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn('h-10 truncate pl-10', adminTheme.input)}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn('relative rounded-xl p-0', adminTheme.hoverSurface)}
            asChild
          >
            <Link
              href="/application/enter/notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-lp-on-surface" />
              {unreadNotificationCount > 0 ? (
                <Badge className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.125rem] items-center justify-center border-0 bg-red-500 px-1 text-[10px] hover:bg-red-500">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Badge>
              ) : null}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="group relative cursor-pointer">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  className={cn('flex items-center gap-3 rounded-xl p-1', adminTheme.hoverSurface)}
                  disabled={isUploading}
                >
                  <Avatar className={cn('relative h-10 w-10 overflow-hidden border-2', adminTheme.avatarRing)}>
                    <AvatarImage src={user.image || undefined} className="object-cover" />
                    <AvatarFallback className={adminTheme.avatarFallback}>{initials}</AvatarFallback>
                    {isUploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </Avatar>
                  <div className="hidden min-w-0 max-w-[11rem] text-left xl:max-w-[14rem] lg:block">
                    {showNameLine ? (
                      <p className="truncate font-heading text-sm font-semibold text-lp-on-surface transition-colors group-hover:text-lp-brand">
                        {name}
                      </p>
                    ) : null}
                    {email ? (
                      <p
                        className={cn(
                          'truncate text-lp-on-surface-variant',
                          showNameLine
                            ? 'text-[10px] leading-tight'
                            : 'text-sm font-medium text-lp-on-surface'
                        )}
                      >
                        {email}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-lp-on-surface">Admin</p>
                    )}
                  </div>
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="liquid-glass rounded-xl border-white/60 p-1 dark:border-white/10">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-lp-on-surface">{user.name || 'Admin'}</p>
                  <p className="text-xs text-lp-on-surface-variant">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg" onClick={() => fileInputRef.current?.click()}>
                <Camera className="mr-2 h-4 w-4" />
                Update Photo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg text-red-600 focus:text-red-600 dark:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
}
