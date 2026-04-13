'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentsTable, type Document } from './DocumentsTable'
import { QualificationCredentialsTable } from './QualificationCredentialsTable'
import { FileCheck, GraduationCap } from 'lucide-react'

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

interface DocumentsManagementTabsProps {
  medical: {
    data: Document[]
    page: number
    totalPages: number
    count: number
    error: string | null
  }
  qualifications: {
    data: QualificationCredentialRow[]
    page: number
    totalPages: number
    count: number
    error: string | null
  }
}

export function DocumentsManagementTabs({ medical, qualifications }: DocumentsManagementTabsProps) {
  const [tab, setTab] = useState('medical')

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl bg-teal-50/80 dark:bg-gray-800/80 p-1 h-auto">
        <TabsTrigger
          value="medical"
          className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5"
        >
          <FileCheck className="h-4 w-4" />
          Patient documents
        </TabsTrigger>
        <TabsTrigger
          value="qualifications"
          className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5"
        >
          <GraduationCap className="h-4 w-4" />
          Qualification docs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="medical" className="mt-6 space-y-4">
        {medical.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {medical.error}
          </p>
        )}
        <DocumentsTable
          initialData={medical.data}
          initialPage={medical.page}
          totalPages={medical.totalPages}
          count={medical.count}
        />
      </TabsContent>

      <TabsContent value="qualifications" className="mt-6 space-y-4">
        {qualifications.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {qualifications.error}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review verification files uploaded by professionals. Approve to allow the verification link on their profile
          and public consultant page; decline if the document does not meet requirements.
        </p>
        <QualificationCredentialsTable
          initialData={qualifications.data}
          initialPage={qualifications.page}
          totalPages={qualifications.totalPages}
          count={qualifications.count}
        />
      </TabsContent>
    </Tabs>
  )
}
