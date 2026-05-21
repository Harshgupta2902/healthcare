'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '../_components/DataTable'
import { QualificationReviewDialog, type QualificationReviewRow } from './QualificationReviewDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'

type QualificationCredentialRow = {
  id: string
  professional_id: string
  degree: string
  institution: string
  year: number | null
  document_url: string
  document_approved: boolean | null
  created_at: string
  professional?: { name: string | null; email: string | null } | { name: string | null; email: string | null }[] | null
}

interface QualificationCredentialsTableProps {
  initialData: QualificationCredentialRow[]
  initialPage: number
  totalPages: number
  count: number
}

function normalizeRow(r: QualificationCredentialRow): QualificationReviewRow {
  const p = r.professional
  const professional = Array.isArray(p) ? p[0] ?? null : p ?? null
  return {
    id: r.id,
    degree: r.degree,
    institution: r.institution,
    year: r.year,
    document_url: r.document_url,
    document_approved: r.document_approved,
    professional,
  }
}

function statusBadge(approved: boolean | null) {
  if (approved === true) {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-none rounded-lg">Approved</Badge>
    )
  }
  if (approved === false) {
    return (
      <Badge className="bg-rose-600 hover:bg-rose-600 text-white border-none rounded-lg">Declined</Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 rounded-lg">
      In review
    </Badge>
  )
}

export function QualificationCredentialsTable({
  initialData,
  initialPage,
  totalPages,
  count,
}: QualificationCredentialsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [selected, setSelected] = useState<QualificationReviewRow | null>(null)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('qsearch', query)
    } else {
      params.delete('qsearch')
    }
    params.set('qpage', '1')
    router.push(`/application/enter/documents?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('qpage', page.toString())
    router.push(`/application/enter/documents?${params.toString()}`)
  }

  const openReview = (row: QualificationCredentialRow) => {
    setSelected(normalizeRow(row))
    setReviewOpen(true)
  }

  const columns = [
    {
      key: 'professional',
      label: 'Professional',
      render: (r: QualificationCredentialRow) => {
        const p = r.professional
        const one = Array.isArray(p) ? p[0] : p
        return one?.name || one?.email || '—'
      },
    },
    { key: 'degree', label: 'Degree / certification' },
    { key: 'institution', label: 'Institution' },
    {
      key: 'year',
      label: 'Year',
      render: (r: QualificationCredentialRow) => (r.year != null ? String(r.year) : '—'),
    },
    {
      key: 'document_approved',
      label: 'Status',
      render: (r: QualificationCredentialRow) => statusBadge(r.document_approved),
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (r: QualificationCredentialRow) => format(new Date(r.created_at), 'MMM dd, yyyy'),
    },
  ]

  return (
    <>
      <DataTable
        data={initialData}
        columns={columns}
        searchPlaceholder="Search degree or institution..."
        onSearch={handleSearch}
        page={initialPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        count={count}
        renderRowActions={(r) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-lp-surface-container/80 dark:hover:bg-white/5"
            title="Review document"
            onClick={() => openReview(r)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      />
      <QualificationReviewDialog
        open={reviewOpen}
        onOpenChange={(o) => {
          setReviewOpen(o)
          if (!o) setSelected(null)
        }}
        row={selected}
        onUpdated={() => router.refresh()}
      />
    </>
  )
}
