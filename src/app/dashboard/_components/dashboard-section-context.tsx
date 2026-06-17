'use client'

import { createContext, useContext } from 'react'
import type { DashboardRole, DashboardSectionId } from './dashboard-nav'
import { useDashboardSection } from '../_hooks/use-dashboard-section'

type DashboardSectionContextValue = {
  role: DashboardRole
  activeSection: DashboardSectionId
  setActiveSection: (section: DashboardSectionId) => void
}

const DashboardSectionContext = createContext<DashboardSectionContextValue | null>(null)

export function DashboardSectionProvider({
  role,
  children,
}: {
  role: DashboardRole
  children: React.ReactNode
}) {
  const { activeSection, setActiveSection } = useDashboardSection(role)

  return (
    <DashboardSectionContext.Provider value={{ role, activeSection, setActiveSection }}>
      {children}
    </DashboardSectionContext.Provider>
  )
}

export function useDashboardSectionContext() {
  const ctx = useContext(DashboardSectionContext)
  if (!ctx) {
    throw new Error('useDashboardSectionContext must be used within DashboardSectionProvider')
  }
  return ctx
}
