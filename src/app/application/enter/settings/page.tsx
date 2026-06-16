import { getAdminRegistrationSettings } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { RegistrationSettingsPanel } from './RegistrationSettingsPanel'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Settings',
  description: 'Admin settings for HealthHere platform configuration.',
  pathname: '/application/enter/settings',
  robots: ROBOTS_NOINDEX,
})

export default async function AdminSettingsPage() {
  const result = await getAdminRegistrationSettings()

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" />

      {!result.success ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {result.error}
        </p>
      ) : (
        <RegistrationSettingsPanel settings={result.data} updatedAt={result.updatedAt} />
      )}
    </div>
  )
}
