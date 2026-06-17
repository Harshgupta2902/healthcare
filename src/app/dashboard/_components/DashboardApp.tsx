'use client'

import type { DashboardRole } from './dashboard-nav'
import { DashboardShell } from './DashboardShell'
import { ClientDashboard } from './ClientDashboard'
import { ProfessionalDashboard } from './ProfessionalDashboard'

type DashboardAppProps = {
  role: DashboardRole
  initialData: Record<string, unknown>
}

export function DashboardApp({ role, initialData }: DashboardAppProps) {
  return (
    <DashboardShell role={role}>
      {role === 'professional' ? (
        <ProfessionalDashboard initialData={initialData} />
      ) : (
        <ClientDashboard initialData={initialData} />
      )}
    </DashboardShell>
  )
}
