'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createProfessional, updateProfessional } from '@/features/admin/actions'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const professionalSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  specialization: z.string().min(1, 'Specialization is required'),
  license_number: z.string().min(1, 'License number is required'),
  bio: z.string().optional().nullable(),
  years_of_experience: z.number().int().min(0).optional().nullable(),
  consultation_fee: z.number().int().min(0).optional().nullable(),
  is_verified: z.boolean(),
  city: z.string().optional().nullable(),
})

type ProfessionalFormData = z.infer<typeof professionalSchema>

interface ProfessionalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  professional?: {
    id: string
    user_id: string
    specialization: string
    license_number: string
    bio: string | null
    years_of_experience: number | null
    consultation_fee: number | null
    is_verified: boolean
    city: string | null
  } | null
  onSuccess: () => void
}

export function ProfessionalDialog({ open, onOpenChange, professional, onSuccess }: ProfessionalDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'professional')
        if (data) setUsers(data)
      }
      fetchUsers()
    }
  }, [open])

  const form = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      user_id: professional?.user_id || '',
      specialization: professional?.specialization || '',
      license_number: professional?.license_number || '',
      bio: professional?.bio || '',
      years_of_experience: professional?.years_of_experience || null,
      consultation_fee: professional?.consultation_fee ? professional.consultation_fee / 100 : null,
      is_verified: professional?.is_verified || false,
      city: professional?.city || '',
    },
  })

  const onSubmit = (data: ProfessionalFormData) => {
    startTransition(async () => {
      try {
        const submitData = {
          ...data,
          consultation_fee: data.consultation_fee ? Math.round(data.consultation_fee * 100) : null,
        }
        if (professional) {
          const result = await updateProfessional(professional.id, submitData)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Professional updated successfully')
        } else {
          const result = await createProfessional(submitData)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Professional created successfully')
        }
        form.reset()
        onSuccess()
      } catch (error: any) {
        toast.error(error.message || 'Failed to save professional')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{professional ? 'Edit Professional' : 'Add New Professional'}</DialogTitle>
          <DialogDescription>
            {professional ? 'Update professional information' : 'Create a new professional profile'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="years_of_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consultation_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Fee ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_verified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Verified</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl"
              >
                {isPending ? 'Saving...' : professional ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
