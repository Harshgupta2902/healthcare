'use client'

const DEVICE_ID_KEY = 'hh_newsletter_device_id'

function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
    return id
  } catch {
    return 'anonymous'
  }
}

/**
 * Stable SHA-256 hash from device signals + persistent local id.
 * Used for newsletter signup rate limiting (not authentication).
 */
export async function getNewsletterDeviceHash(): Promise<string> {
  const parts = [
    getOrCreateDeviceId(),
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${screen.width}x${screen.height}`,
    String(screen.colorDepth),
    navigator.platform ?? '',
  ].join('|')

  const encoded = new TextEncoder().encode(parts)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
