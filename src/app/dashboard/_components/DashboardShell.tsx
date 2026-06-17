'use client'

import type { DashboardRole } from './dashboard-nav'
import { DashboardSectionProvider } from './dashboard-section-context'
import { DashboardMobileNav } from './DashboardMobileNav'
import { DashboardPageHeader } from './DashboardPageHeader'
import { DashboardSidebar } from './DashboardSidebar'

export function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole
  children: React.ReactNode
}) {
  return (
    <DashboardSectionProvider role={role}>
      <div className="relative flex h-[calc(100dvh-4rem)] min-h-0 overflow-hidden lg:h-[calc(100dvh-5rem)]">
        <DashboardSidebar role={role} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-clip px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-8">
            <DashboardPageHeader role={role} />
            {children}
          </main>
        </div>
        <DashboardMobileNav role={role} />
      </div>
    </DashboardSectionProvider>
  )
}
