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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createMedication, updateMedication } from '@/features/admin/actions'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const medicationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  medication_name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
  prescribing_doctor: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

type MedicationFormData = z.infer<typeof medicationSchema>

interface MedicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medication?: {
    id: string
    user_id: string
    medication_name: string
    dosage: string
    frequency: string
    start_date: string
    end_date: string | null
    prescribing_doctor: string | null
    notes: string | null
    is_active: boolean
  } | null
  onSuccess: () => void
}

export function MedicationDialog({ open, onOpenChange, medication, onSuccess }: MedicationDialogProps) {
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

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      user_id: medication?.user_id || '',
      medication_name: medication?.medication_name || '',
      dosage: medication?.dosage || '',
      frequency: medication?.frequency || '',
      start_date: medication?.start_date || '',
      end_date: medication?.end_date || '',
      prescribing_doctor: medication?.prescribing_doctor || '',
      notes: medication?.notes || '',
      is_active: medication?.is_active ?? true,
    },
  })

  const onSubmit = (data: MedicationFormData) => {
    startTransition(async () => {
      try {
        if (medication) {
          await updateMedication(medication.id, data)
          toast.success('Medication updated successfully')
        } else {
          await createMedication(data)
          toast.success('Medication created successfully')
        }
        form.reset()
        onSuccess()
      } catch (error: any) {
        toast.error(error.message || 'Failed to save medication')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{medication ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
          <DialogDescription>
            {medication ? 'Update medication information' : 'Add a new medication'}
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
              name="medication_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Name</FormLabel>
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
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
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
            </div>
            <FormField
              control={form.control}
              name="prescribing_doctor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prescribing Doctor</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
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
                {isPending ? 'Saving...' : medication ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
