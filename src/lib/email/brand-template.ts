/**
 * Protealth transactional / newsletter email shell — aligned with lp-* theme tokens.
 * Inline styles only; email-client safe layout.
 */

export const EMAIL = {
  surface: '#f8f9ff',
  onSurface: '#0b1c30',
  onSurfaceVariant: '#44474d',
  outline: '#c5c6cd',
  outlineLight: '#e4e9f2',
  brand: '#0059bb',
  brandBright: '#0070ea',
  onBrand: '#ffffff',
  surfaceContainer: '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  card: '#ffffff',
  muted: '#76849f',
  fontSans: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontHeading: "'Manrope', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  radius: '16px',
  maxWidth: '600',
} as const

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function emailHead(): string {
  return `
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Protealth</title>
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700&display=swap" rel="stylesheet" />
  <!--<![endif]-->
  `
}

function emailHeader(appUrl: string): string {
  return `
  <tr>
    <td style="background:${EMAIL.brand};background:linear-gradient(135deg, ${EMAIL.brand} 0%, ${EMAIL.brandBright} 100%);padding:28px 32px;border-radius:${EMAIL.radius} ${EMAIL.radius} 0 0;">
      <a href="${appUrl}" style="text-decoration:none;display:inline-block;">
        <span style="font-family:${EMAIL.fontHeading};font-size:26px;font-weight:700;color:${EMAIL.onBrand};letter-spacing:-0.02em;">Protealth</span>
      </a>
      <p style="margin:8px 0 0;font-family:${EMAIL.fontSans};font-size:13px;color:rgba(255,255,255,0.88);line-height:1.4;">
        Healthcare that actually works
      </p>
    </td>
  </tr>`
}

type BuildEmailShellOptions = {
  appUrl: string
  bodyHtml: string
  footerHtml?: string
}

/** Full HTML document with branded header card shell. */
export function buildEmailShell({ appUrl, bodyHtml, footerHtml }: BuildEmailShellOptions): string {
  const footer =
    footerHtml ??
    `<p style="margin:0;font-family:${EMAIL.fontSans};font-size:12px;line-height:1.6;color:${EMAIL.muted};text-align:center;">
        <a href="${appUrl}" style="color:${EMAIL.brand};text-decoration:none;font-weight:600;">Visit Protealth</a>
      </p>`

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>${emailHead()}</head>
<body style="margin:0;padding:0;background-color:${EMAIL.surface};font-family:${EMAIL.fontSans};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="background-color:${EMAIL.surface};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="${EMAIL.maxWidth}" cellspacing="0" cellpadding="0" border="0" role="presentation"
          style="max-width:${EMAIL.maxWidth}px;width:100%;background-color:${EMAIL.card};border:1px solid ${EMAIL.outlineLight};border-radius:${EMAIL.radius};overflow:hidden;box-shadow:0 4px 24px rgba(0,89,187,0.08);">
          ${emailHeader(appUrl)}
          <tr>
            <td style="padding:32px 32px 28px;font-family:${EMAIL.fontSans};color:${EMAIL.onSurface};">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background-color:${EMAIL.surfaceContainer};border-top:1px solid ${EMAIL.outlineLight};">
              ${footer}
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-family:${EMAIL.fontSans};font-size:11px;line-height:1.5;color:${EMAIL.muted};text-align:center;max-width:${EMAIL.maxWidth}px;">
          &copy; ${new Date().getFullYear()} Protealth. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-family:${EMAIL.fontHeading};font-size:24px;font-weight:700;line-height:1.3;color:${EMAIL.onSurface};">${text}</h1>`
}

export function emailParagraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${EMAIL.fontSans};font-size:16px;line-height:1.65;color:${EMAIL.onSurfaceVariant};">${html}</p>`
}

export function emailList(items: string[]): string {
  const lis = items
    .map(
      (item) =>
        `<li style="margin-bottom:8px;font-family:${EMAIL.fontSans};font-size:15px;line-height:1.55;color:${EMAIL.onSurfaceVariant};">${item}</li>`
    )
    .join('')
  return `<ul style="margin:0 0 20px;padding-left:20px;text-align:left;">${lis}</ul>`
}

export function emailPrimaryButton(href: string, label: string): string {
  return `
  <table cellspacing="0" cellpadding="0" border="0" role="presentation" style="margin:8px 0 4px;">
    <tr>
      <td align="center" style="border-radius:12px;background:${EMAIL.brand};background:linear-gradient(135deg, ${EMAIL.brand} 0%, ${EMAIL.brandBright} 100%);">
        <a href="${href}" target="_blank"
          style="display:inline-block;padding:14px 32px;font-family:${EMAIL.fontSans};font-size:15px;font-weight:600;color:${EMAIL.onBrand};text-decoration:none;border-radius:12px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`
}

export function emailInlineLink(href: string, label: string): string {
  return `<a href="${href}" style="color:${EMAIL.brand};text-decoration:underline;font-weight:500;">${label}</a>`
}

export function emailUnsubscribeFooter(unsubscribeUrl: string, extraLine?: string): string {
  const extra = extraLine
    ? `<p style="margin:0 0 12px;font-family:${EMAIL.fontSans};font-size:12px;line-height:1.6;color:${EMAIL.muted};text-align:center;">${extraLine}</p>`
    : ''
  return `${extra}<p style="margin:0;font-family:${EMAIL.fontSans};font-size:12px;line-height:1.6;color:${EMAIL.muted};text-align:center;">
    Don&rsquo;t want these emails? ${emailInlineLink(unsubscribeUrl, 'Unsubscribe in one click')}.
  </p>`
}

export function emailDetailRow(label: string, value: string): string {
  return `<p style="margin:0 0 10px;font-family:${EMAIL.fontSans};font-size:16px;line-height:1.6;color:${EMAIL.onSurfaceVariant};">
    <strong style="color:${EMAIL.onSurface};">${label}</strong> ${escapeHtml(value)}
  </p>`
}
