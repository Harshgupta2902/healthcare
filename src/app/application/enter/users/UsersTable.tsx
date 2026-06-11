'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { UserDialog } from './UserDialog'
import { DeleteDialog } from '../_components/DeleteDialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { createUser, updateUser, deleteUser } from '@/features/admin/actions'
import { toast } from 'sonner'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  phone: string | null
  image: string | null
  created_at: string
}

interface UsersTableProps {
  initialData: User[]
  initialPage: number
  totalPages: number
  count: number
}

function userInitialLetter(user: User): string {
  const name = user.name?.trim()
  if (name) return name[0].toUpperCase()
  const email = user.email?.trim()
  if (email) return email[0].toUpperCase()
  return '?'
}

export function UsersTable({ initialData, initialPage, totalPages, count }: UsersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/application/enter/users?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/application/enter/users?${params.toString()}`)
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    startTransition(async () => {
      try {
        const result = await deleteUser(selectedUser.id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('User deleted successfully')
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete user')
      }
    })
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 border border-lp-outline-variant/40 dark:border-gray-600">
            <AvatarImage src={user.image || undefined} alt={user.name || user.email || 'User'} />
            <AvatarFallback className="bg-gradient-to-br from-lp-brand to-lp-brand-bright text-xs font-bold text-white">
              {userInitialLetter(user)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => (
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
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (user: User) => format(new Date(user.created_at), 'MMM dd, yyyy'),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search users..."
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Add User"
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
      />
      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onSuccess={() => {
          setIsDialogOpen(false)
          router.refresh()
        }}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        description={`Permanently delete ${selectedUser?.name || selectedUser?.email}? This removes their login account and all profile data. The email can be used to register again.`}
        isPending={isPending}
      />
    </>
  )
}
