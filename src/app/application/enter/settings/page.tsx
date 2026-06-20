import { getAdminBookingSettings, getAdminRegistrationSettings } from '@/features/admin/actions'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { BookingSettingsPanel } from './BookingSettingsPanel'
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
  const [registrationResult, bookingResult] = await Promise.all([
    getAdminRegistrationSettings(),
    getAdminBookingSettings(),
  ])

  if (!registrationResult.success || !bookingResult.success) {
    const error = !registrationResult.success
      ? registrationResult.error
      : !bookingResult.success
        ? bookingResult.error
        : 'Could not load settings.'

    return (
      <div className="space-y-6">
        <AdminPageHeader title="Settings" />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" />
      <RegistrationSettingsPanel
        settings={registrationResult.data}
        updatedAt={registrationResult.updatedAt}
      />
      <BookingSettingsPanel settings={bookingResult.data} updatedAt={bookingResult.updatedAt} />
    </div>
  )
}
