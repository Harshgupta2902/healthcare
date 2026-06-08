'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { DataTable } from '../../_components/DataTable'
import { Badge } from '@/components/ui/badge'
import { deleteBlogCategory } from '@/features/blog/admin-actions'
import type { BlogCategoryRow } from '@/features/blog/schema'
import { CategoryDialog } from './CategoryDialog'
import { DeleteDialog } from '../../_components/DeleteDialog'
import { toast } from 'sonner'

type CategoriesTableProps = {
  initialData: BlogCategoryRow[]
}

export function CategoriesTable({ initialData }: CategoriesTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BlogCategoryRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BlogCategoryRow | null>(null)

  return (
    <>
      <DataTable
        data={initialData}
        columns={[
          { key: 'name', label: 'Name', render: (item) => <span className="font-medium">{item.name}</span> },
          {
            key: 'slug',
            label: 'Slug',
            render: (item) => <span className="font-mono text-xs text-lp-on-surface-variant">{item.slug}</span>,
          },
          {
            key: 'sort_order',
            label: 'Order',
            render: (item) => item.sort_order,
          },
          {
            key: 'is_active',
            label: 'Status',
            render: (item) => (
              <Badge variant={item.is_active ? 'default' : 'secondary'}>
                {item.is_active ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
        ]}
        onAdd={() => {
          setEditTarget(null)
          setDialogOpen(true)
        }}
        addLabel="Add category"
        onEdit={(item) => {
          setEditTarget(item)
          setDialogOpen(true)
        }}
        onDelete={(item) => setDeleteTarget(item)}
        count={initialData.length}
      />

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editTarget}
        onSuccess={() => router.refresh()}
      />

      <DeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete category"
        description={`Delete "${deleteTarget?.name}"? Categories with posts cannot be deleted.`}
        onConfirm={() => {
          if (!deleteTarget) return
          startTransition(async () => {
            const result = await deleteBlogCategory(deleteTarget.id)
            if (!result.success) {
              toast.error(result.error)
              return
            }
            toast.success('Category deleted')
            setDeleteTarget(null)
            router.refresh()
          })
        }}
        isPending={isPending}
      />
    </>
  )
}
