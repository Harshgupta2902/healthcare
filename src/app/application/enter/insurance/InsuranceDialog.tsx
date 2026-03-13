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
import { createInsurance, updateInsurance } from '@/features/admin/actions'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const insuranceSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  provider_name: z.string().min(1, 'Provider name is required'),
  policy_number: z.string().min(1, 'Policy number is required'),
  group_number: z.string().optional().nullable(),
  policy_holder_name: z.string().min(1, 'Policy holder name is required'),
  relationship_to_holder: z.string().optional().nullable(),
  expiration_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

type InsuranceFormData = z.infer<typeof insuranceSchema>

interface InsuranceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  insurance?: {
    id: string
    user_id: string
    provider_name: string
    policy_number: string
    group_number: string | null
    policy_holder_name: string
    relationship_to_holder: string | null
    expiration_date: string | null
    notes: string | null
  } | null
  onSuccess: () => void
}

export function InsuranceDialog({ open, onOpenChange, insurance, onSuccess }: InsuranceDialogProps) {
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

  const form = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      user_id: insurance?.user_id || '',
      provider_name: insurance?.provider_name || '',
      policy_number: insurance?.policy_number || '',
      group_number: insurance?.group_number || '',
      policy_holder_name: insurance?.policy_holder_name || '',
      relationship_to_holder: insurance?.relationship_to_holder || '',
      expiration_date: insurance?.expiration_date || '',
      notes: insurance?.notes || '',
    },
  })

  const onSubmit = (data: InsuranceFormData) => {
    startTransition(async () => {
      try {
        if (insurance) {
          await updateInsurance(insurance.id, data)
          toast.success('Insurance updated successfully')
        } else {
          await createInsurance(data)
          toast.success('Insurance created successfully')
        }
        form.reset()
        onSuccess()
      } catch (error: any) {
        toast.error(error.message || 'Failed to save insurance')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{insurance ? 'Edit Insurance' : 'Add Insurance'}</DialogTitle>
          <DialogDescription>
            {insurance ? 'Update insurance information' : 'Add a new insurance record'}
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
              name="provider_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Name</FormLabel>
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
                name="policy_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="group_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="policy_holder_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Holder Name</FormLabel>
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
                name="relationship_to_holder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Holder</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
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
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl"
              >
                {isPending ? 'Saving...' : insurance ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
