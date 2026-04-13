'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Search, Bell, LogOut, User, Camera, Loader2 } from 'lucide-react'
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

interface AdminNavbarProps {
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
}

export function AdminNavbar({ user }: AdminNavbarProps) {
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
    } catch (error: any) {
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

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-teal-200/50 dark:border-gray-700/50 shadow-sm"
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-gray-800/50 border-teal-200 dark:border-gray-700 rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl hover:bg-teal-50 dark:hover:bg-gray-800"
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute top-1 right-1 w-2 h-2 p-0 bg-red-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 rounded-xl hover:bg-teal-50 dark:hover:bg-gray-800 p-1"
                  disabled={isUploading}
                >
                  <Avatar className="w-10 h-10 border-2 border-teal-500 relative overflow-hidden group">
                    <AvatarImage src={user.image || undefined} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
                      {initials}
                    </AvatarFallback>
                    {isUploading ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </Avatar>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{user.name || 'Admin'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{user.email}</p>
                  </div>
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
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
                className="text-red-600 dark:text-red-400 rounded-lg focus:text-red-600"
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
