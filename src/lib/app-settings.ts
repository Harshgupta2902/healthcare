import 'server-only'

import { createClient } from '@/lib/supabase/server'
import {
  DEFAULT_REGISTRATION_SETTINGS,
  parseRegistrationSettings,
  type RegistrationSettings,
} from '@/lib/registration-settings'

export {
  DEFAULT_REGISTRATION_SETTINGS,
  parseRegistrationSettings,
  REGISTRATION_SETTINGS_KEY,
  registrationSettingsSchema,
  type RegistrationSettings,
} from '@/lib/registration-settings'

export { REGISTRATION_OTP_EXPIRY_MINUTES, REGISTRATION_OTP_LENGTH } from '@/lib/registration-constants'

/** Public read via RPC — used by register flow and server actions. */
export async function getRegistrationSettings(): Promise<RegistrationSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_registration_settings')

  if (error) {
    console.error('[getRegistrationSettings] RPC error:', error)
    return DEFAULT_REGISTRATION_SETTINGS
  }

  return parseRegistrationSettings(data)
}
