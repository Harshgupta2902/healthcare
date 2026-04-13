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
import { createDocument, updateDocument } from '@/features/admin/actions'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const documentSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  document_name: z.string().min(1, 'Document name is required'),
  document_type: z.string().min(1, 'Document type is required'),
  file_url: z.string().url('Invalid file URL'),
  file_size: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
})

type DocumentFormData = z.infer<typeof documentSchema>

interface DocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: {
    id: string
    user_id: string
    document_name: string
    document_type: string
    file_url: string
    file_size: number | null
    notes: string | null
  } | null
  onSuccess: () => void
}

export function DocumentDialog({ open, onOpenChange, document, onSuccess }: DocumentDialogProps) {
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

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      user_id: document?.user_id || '',
      document_name: document?.document_name || '',
      document_type: document?.document_type || '',
      file_url: document?.file_url || '',
      file_size: document?.file_size || null,
      notes: document?.notes || '',
    },
  })

  const onSubmit = (data: DocumentFormData) => {
    startTransition(async () => {
      try {
        if (document) {
          const result = await updateDocument(document.id, data)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Document updated successfully')
        } else {
          const result = await createDocument(data)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          toast.success('Document created successfully')
        }
        form.reset()
        onSuccess()
      } catch (error: any) {
        toast.error(error.message || 'Failed to save document')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle>{document ? 'Edit Document' : 'Add Document'}</DialogTitle>
          <DialogDescription>
            {document ? 'Update document information' : 'Add a new medical document'}
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
              name="document_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="xray">X-Ray</SelectItem>
                      <SelectItem value="lab">Lab Results</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File URL</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-xl" placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Size (bytes)</FormLabel>
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
                {isPending ? 'Saving...' : document ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
