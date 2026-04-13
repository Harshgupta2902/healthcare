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
import { createAppointment, updateAppointment } from '@/features/admin/actions'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const appointmentSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  professional_id: z.string().uuid('Invalid professional ID'),
  appointment_type: z.string().min(1, 'Appointment type is required'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  notes: z.string().optional().nullable(),
  meeting_url: z.string().optional().nullable(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: {
    id: string
    client_id: string
    professional_id: string
    appointment_type: string
    status: string
    start_time: string
    end_time: string
    notes: string | null
    meeting_url: string | null
  } | null
  onSuccess: () => void
}

export function AppointmentDialog({ open, onOpenChange, appointment, onSuccess }: AppointmentDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [clients, setClients] = useState<{ id: string; name: string; email: string }[]>([])
  const [professionals, setProfessionals] = useState<{ id: string; name: string; email: string }[]>([])

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const supabase = createClient()
        const [clientsRes, professionalsRes] = await Promise.all([
          supabase.from('users').select('id, name, email').eq('role', 'client'),
          supabase.from('users').select('id, name, email').eq('role', 'professional'),
        ])
        if (clientsRes.data) setClients(clientsRes.data)
        if (professionalsRes.data) setProfessionals(professionalsRes.data)
      }
      fetchData()
    }
  }, [open])

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      client_id: appointment?.client_id || '',
      professional_id: appointment?.professional_id || '',
      appointment_type: appointment?.appointment_type || '',
      status: (appointment?.status as any) || 'pending',
      start_time: appointment?.start_time ? new Date(appointment.start_time).toISOString().slice(0, 16) : '',
      end_time: appointment?.end_time ? new Date(appointment.end_time).toISOString().slice(0, 16) : '',
      notes: appointment?.notes || '',
      meeting_url: appointment?.meeting_url || '',
    },
  })

  const onSubmit = (data: AppointmentFormData) => {
    startTransition(async () => {
      try {
        const submitData = {
          ...data,
          start_time: new Date(data.start_time).toISOString(),
          end_time: new Date(data.end_time).toISOString(),
        }
        if (appointment) {
          const result = await updateAppointment(appointment.id, submitData)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Appointment updated successfully')
        } else {
          const result = await createAppointment(submitData)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Appointment created successfully')
        }
        form.reset()
        onSuccess()
      } catch (error: any) {
        toast.error(error.message || 'Failed to save appointment')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Edit Appointment' : 'Add New Appointment'}</DialogTitle>
          <DialogDescription>
            {appointment ? 'Update appointment details' : 'Create a new appointment'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.email})
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
                name="professional_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select professional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            {professional.name} ({professional.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl" />
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="meeting_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting URL</FormLabel>
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
                {isPending ? 'Saving...' : appointment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
