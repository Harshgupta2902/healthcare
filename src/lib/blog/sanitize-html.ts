const BLOCKED_TAGS = /<\/?(?:script|iframe|object|embed|form|input|button|meta|link|base|style)[^>]*>/gi
const EVENT_HANDLERS = /\s(on\w+|javascript:)[^>]*/gi

/** Strip dangerous markup before storing or rendering blog HTML. */
export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return ''
  return html
    .replace(BLOCKED_TAGS, '')
    .replace(EVENT_HANDLERS, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}
