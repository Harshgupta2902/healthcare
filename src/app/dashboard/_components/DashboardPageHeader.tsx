'use client'

import { getNavItemForSection, type DashboardRole } from './dashboard-nav'
import { useDashboardSectionContext } from './dashboard-section-context'
import { dashboardPageSubtitle, dashboardPageTitle } from './dashboard-theme'

const roleTitles: Record<DashboardRole, { title: string; subtitle: string }> = {
  client: {
    title: 'Patient Medical Dashboard',
    subtitle: 'Centralized hub for your health metrics, prescriptions, and medical history.',
  },
  professional: {
    title: 'Professional Dashboard',
    subtitle: 'Manage your practice, consultations, schedule, and client records.',
  },
}

export function DashboardPageHeader({ role }: { role: DashboardRole }) {
  const { activeSection } = useDashboardSectionContext()
  const section = getNavItemForSection(role, activeSection)
  const roleMeta = roleTitles[role]

  return (
    <div className="mb-6 sm:mb-8">
      <p className="font-sans text-xs font-semibold uppercase tracking-wider text-lp-brand">
        {section?.label ?? 'Dashboard'}
      </p>
      <h1 className={`${dashboardPageTitle} mt-1`}>{roleMeta.title}</h1>
      <p className={dashboardPageSubtitle}>{roleMeta.subtitle}</p>
    </div>
  )
}
