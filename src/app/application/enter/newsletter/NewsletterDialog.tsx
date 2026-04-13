'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransition } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createNewsletterSubscriber, updateNewsletterSubscriber } from '@/features/admin/actions'
import { toast } from 'sonner'

const newsletterSchema = z.object({
  email: z.string().email('Invalid email'),
  status: z.enum(['active', 'inactive']),
})

type NewsletterFormData = z.infer<typeof newsletterSchema>

interface NewsletterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriber?: {
    id: number
    email: string
    status: string
  } | null
  onSuccess: () => void
}

export function NewsletterDialog({ open, onOpenChange, subscriber, onSuccess }: NewsletterDialogProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: subscriber?.email || '',
      status: (subscriber?.status as 'active' | 'inactive') || 'active',
    },
  })

  const onSubmit = (data: NewsletterFormData) => {
    startTransition(async () => {
      try {
        if (subscriber) {
          const result = await updateNewsletterSubscriber(subscriber.id, data)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Subscriber updated successfully')
        } else {
          const result = await createNewsletterSubscriber(data)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Subscriber created successfully')
        }
        form.reset()
        onSuccess()
      } catch (error: any) {
        toast.error(error.message || 'Failed to save subscriber')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle>{subscriber ? 'Edit Subscriber' : 'Add Subscriber'}</DialogTitle>
          <DialogDescription>
            {subscriber ? 'Update subscriber information' : 'Add a new newsletter subscriber'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} className="rounded-xl" />
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
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
                {isPending ? 'Saving...' : subscriber ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
