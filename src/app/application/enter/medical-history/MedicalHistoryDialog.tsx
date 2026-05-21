'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransition, useEffect, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createMedicalHistory, updateMedicalHistory } from '@/features/admin/actions'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const medicalHistorySchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  condition_name: z.string().min(1, 'Condition name is required'),
  diagnosis_date: z.string().optional().nullable(),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional().nullable(),
})

type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>

interface MedicalHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: {
    id: string
    user_id: string
    condition_name: string
    diagnosis_date: string | null
    status: string
    notes: string | null
  } | null
  onSuccess: () => void
}

export function MedicalHistoryDialog({ open, onOpenChange, record, onSuccess }: MedicalHistoryDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        const supabase = createClient()
        const { data } = await supabase.from('users').select('id, name, email')
        if (data) setUsers(data)
      }
      fetchUsers()
    }
  }, [open])

  const form = useForm<MedicalHistoryFormData>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      user_id: record?.user_id || '',
      condition_name: record?.condition_name || '',
      diagnosis_date: record?.diagnosis_date || '',
      status: record?.status || 'active',
      notes: record?.notes || '',
    },
  })

  const onSubmit = (data: MedicalHistoryFormData) => {
    startTransition(async () => {
      try {
        if (record) {
          const result = await updateMedicalHistory(record.id, data)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Medical history updated successfully')
        } else {
          const result = await createMedicalHistory(data)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Medical history created successfully')
        }
        form.reset()
        onSuccess()
      } catch (error: any) {
        toast.error(error.message || 'Failed to save medical history')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit Medical History' : 'Add Medical History'}</DialogTitle>
          <DialogDescription>
            {record ? 'Update medical history record' : 'Create a new medical history record'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select patient" />
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
              name="condition_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="diagnosis_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ''}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="chronic">Chronic</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
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
                className="rounded-xl bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand shadow-lg shadow-lp-brand/25 hover:shadow-xl"
              >
                {isPending ? 'Saving...' : record ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
