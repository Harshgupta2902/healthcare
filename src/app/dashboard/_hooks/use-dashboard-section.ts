'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  type DashboardRole,
  type DashboardSectionId,
  getDefaultSectionForRole,
  normalizeDashboardSection,
} from '../_components/dashboard-nav'

function readHashSection(role: DashboardRole): DashboardSectionId {
  if (typeof window === 'undefined') return getDefaultSectionForRole(role)
  return normalizeDashboardSection(window.location.hash, role)
}

export function useDashboardSection(role: DashboardRole) {
  const [activeSection, setActiveSectionState] = useState<DashboardSectionId>(() =>
    getDefaultSectionForRole(role),
  )

  useEffect(() => {
    const syncFromHash = () => {
      setActiveSectionState(readHashSection(role))
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [role])

  const setActiveSection = useCallback(
    (section: DashboardSectionId) => {
      const normalized = normalizeDashboardSection(section, role)
      const nextHash = `#${normalized}`
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash
      } else {
        setActiveSectionState(normalized)
      }
    },
    [role],
  )

  return { activeSection, setActiveSection }
}
