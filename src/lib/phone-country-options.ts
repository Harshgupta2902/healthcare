import rawCountries from './phone-countries-data.json'

/** E.164 dial prefix when none selected; national digits in `users.phone`. */
export const DEFAULT_PHONE_COUNTRY_CODE = '+91'

export const DEFAULT_PHONE_COUNTRY_ISO = 'IN'

export type PhoneCountryDialOption = {
  iso2: string
  name: string
  dialCode: string
  minLength: number
  maxLength: number
  label: string
}

type PhoneCountryRaw = {
  name: string
  iso2: string
  dialDigits: string
  minLength: number
  maxLength: number
}

/** When several territories share the same calling code, prefer this ISO after reload (DB stores dial only). */
const PREFERRED_ISO_BY_DIAL: Record<string, string> = {
  '1': 'US',
  '7': 'RU',
  '44': 'GB',
  '47': 'NO',
  '61': 'AU',
  '262': 'RE',
  '590': 'GP',
  '672': 'NF',
  '64': 'NZ',
  '358': 'FI',
  '500': 'FK',
}

function dialDigitsToE164(digits: string): string {
  return `+${digits.replace(/\D/g, '')}`
}

function buildOptions(): PhoneCountryDialOption[] {
  const list = (rawCountries as PhoneCountryRaw[]).map((r) => {
    const dialCode = dialDigitsToE164(r.dialDigits)
    return {
      iso2: r.iso2,
      name: r.name,
      dialCode,
      minLength: r.minLength,
      maxLength: r.maxLength,
      label: `${r.name} (${dialCode})`,
    }
  })
  list.sort((a, b) => a.name.localeCompare(b.name))
  return list
}

export const PHONE_COUNTRY_DIAL_OPTIONS: PhoneCountryDialOption[] = buildOptions()

const optionByIso2 = new Map(PHONE_COUNTRY_DIAL_OPTIONS.map((o) => [o.iso2, o]))

const FLAG_CDN =
  'https://raw.githubusercontent.com/Harshgupta2902/intl_phone/master/assets/flags'

export function phoneCountryFlagUrl(iso2: string): string {
  const code = iso2.toLowerCase().replace(/[^a-z]/g, '')
  return `${FLAG_CDN}/${code}.png`
}

export function getPhoneCountryOptionByIso2(iso2: string): PhoneCountryDialOption | undefined {
  return optionByIso2.get(iso2.toUpperCase())
}

export function normalizePhoneCountryCode(raw: string | null | undefined): string | null {
  if (raw == null || !String(raw).trim()) return null
  const s = String(raw).trim()
  if (!s.startsWith('+')) return null
  return s
}

/** True if `dial` matches a known E.164 prefix in the bundled country list. */
export function isKnownPhoneCountryDial(dial: string | null | undefined): boolean {
  const n = normalizePhoneCountryCode(dial ?? undefined)
  if (!n) return false
  return PHONE_COUNTRY_DIAL_OPTIONS.some((o) => o.dialCode === n)
}

/**
 * Picks a territory ISO from stored E.164 prefix alone (ambiguous for shared codes, e.g. +1).
 */
export function resolveCountryIsoFromDialCode(dial: string | null | undefined): string {
  const norm = normalizePhoneCountryCode(dial ?? undefined)
  if (!norm) return DEFAULT_PHONE_COUNTRY_ISO
  const digits = norm.slice(1)
  const matches = PHONE_COUNTRY_DIAL_OPTIONS.filter((o) => o.dialCode === norm)
  if (matches.length === 0) return DEFAULT_PHONE_COUNTRY_ISO
  if (matches.length === 1) return matches[0].iso2
  const pref = PREFERRED_ISO_BY_DIAL[digits]
  if (pref) {
    const hit = matches.find((m) => m.iso2 === pref)
    if (hit) return hit.iso2
  }
  return matches[0].iso2
}

/**
 * Option for length rules: use `countryIso` when it matches the selected dial (e.g. CA vs US for +1),
 * otherwise fall back to the default territory for that dial.
 */
export function getPhoneCountryOptionForValidation(
  dialCode: string | null | undefined,
  countryIso: string | null | undefined
): PhoneCountryDialOption | undefined {
  const norm = normalizePhoneCountryCode(dialCode ?? undefined)
  if (!norm || !isKnownPhoneCountryDial(norm)) return undefined
  const iso = (countryIso ?? '').trim().toUpperCase()
  const byIso = iso.length === 2 ? getPhoneCountryOptionByIso2(iso) : undefined
  if (byIso && byIso.dialCode === norm) return byIso
  return getPhoneCountryOptionByIso2(resolveCountryIsoFromDialCode(norm))
}

/** For display / masking: space between code and national. */
export function combineInternationalPhone(
  countryCode: string | null | undefined,
  nationalDigits: string | null | undefined
): string | null {
  const code = normalizePhoneCountryCode(countryCode ?? undefined)
  const national = (nationalDigits ?? '').replace(/\D/g, '')
  if (!national && !code) return null
  if (code && national) return `${code} ${national}`
  if (national) return national
  return code
}
