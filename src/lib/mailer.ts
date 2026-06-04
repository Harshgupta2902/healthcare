import 'server-only'

import nodemailer, { type Transporter } from 'nodemailer'
import { createUnsubscribeToken } from '@/lib/newsletter-token'

/**
 * Singleton SMTP transporter.
 *
 * Required env:
 *  - SMTP_USER       Gmail address used to send mail
 *  - SMTP_PASS       Gmail app password (not the account password)
 *
 * Optional env:
 *  - SMTP_FROM_NAME  Display name for the sender (default: "HealthHere")
 *  - SMTP_SERVICE    Nodemailer service preset (default: "gmail")
 *  - APP_URL         Public URL used in email CTAs (default: "https://healthhere.com")
 */
let transporter: Transporter | null = null

function getTransporter(): Transporter {
    if (transporter) return transporter

    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!user || !pass) {
        throw new Error(
            'Missing SMTP credentials. Please set SMTP_USER and SMTP_PASS in your environment.'
        )
    }

    transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: { user, pass },
    })

    return transporter
}

function getFromAddress(): string {
    const fromName = process.env.SMTP_FROM_NAME || 'HealthHere'
    const user = process.env.SMTP_USER as string
    return `"${fromName}" <${user}>`
}

function getAppUrl(): string {
    return process.env.APP_URL || 'https://healthhere.com'
}

function buildUnsubscribeUrl(email: string): string {
    const token = createUnsubscribeToken(email)
    return `${getAppUrl().replace(/\/+$/, '')}/unsubscribe?t=${encodeURIComponent(token)}`
}

/**
 * Newsletter welcome email template.
 * Returns the full HTML string. Kept separate so it is easy to tweak
 * without touching the send logic.
 */
function newsletterWelcomeTemplate(userName: string, unsubscribeUrl: string): string {
    const appUrl = getAppUrl()

    return `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
            <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" cellspacing="0" cellpadding="0"
                            style="background:#ffffff; padding:40px; border-radius:12px;">
                            <tr>
                                <td align="center">
                                    <h1 style="color:#0f766e; margin:0 0 16px;">Welcome to HealthHere, ${userName} 👋</h1>

                                    <p style="color:#444; font-size:16px; line-height:24px;">
                                        Thanks for subscribing to our newsletter. We're excited to have you with us.
                                    </p>

                                    <p style="color:#444; font-size:16px; line-height:24px;">
                                        Here's what you can expect from us:
                                    </p>

                                    <ul style="text-align:left; color:#555; font-size:15px; line-height:22px;">
                                        <li>Latest health tips and articles</li>
                                        <li>Updates on new services and features</li>
                                        <li>Special offers and announcements</li>
                                    </ul>

                                    <a href="${appUrl}"
                                        style="
                                            display:inline-block;
                                            background:#0f766e;
                                            color:#ffffff;
                                            text-decoration:none;
                                            padding:14px 28px;
                                            border-radius:8px;
                                            margin-top:24px;
                                            font-weight:600;
                                        ">
                                        Visit HealthHere
                                    </a>

                                    <p style="margin-top:32px; color:#999; font-size:12px;">
                                        Don't want these emails?
                                        <a href="${unsubscribeUrl}" style="color:#0f766e; text-decoration:underline;">
                                            Unsubscribe in one click
                                        </a>.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `
}

/**
 * Send the newsletter welcome email to a subscriber.
 * Throws on configuration / send failure so the caller can decide what to do.
 */
export async function sendNewsletterEmail(
    userEmail: string,
    userName?: string
): Promise<void> {
    const t = getTransporter()

    const safeName = (userName && userName.trim()) || userEmail.split('@')[0] || 'there'
    const unsubscribeUrl = buildUnsubscribeUrl(userEmail)

    const info = await t.sendMail({
        from: getFromAddress(),
        to: userEmail,
        subject: 'Welcome to the HealthHere Newsletter 🎉',
        html: newsletterWelcomeTemplate(safeName, unsubscribeUrl),
        // RFC 8058 — let Gmail / Apple Mail render a native one-click unsubscribe button.
        headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
    })

    console.log('[mailer] Newsletter email sent:', info.messageId)
}

/**
 * Admin broadcast: rich HTML from Lexical (body fragment) wrapped in a simple shell
 * with a per-recipient one-click unsubscribe link and RFC 8058 headers.
 */
export async function sendNewsletterBroadcastEmail(
    to: string,
    subject: string,
    innerContentHtml: string
): Promise<void> {
    const t = getTransporter()
    const unsubscribeUrl = buildUnsubscribeUrl(to)

    const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family: Arial, Helvetica, sans-serif; background:#f4f4f4;">
  <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="600" cellspacing="0" cellpadding="0" role="presentation"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 28px;">
              <div style="color:#1f2937;font-size:16px;line-height:1.6;">
                ${innerContentHtml}
              </div>
              <p style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;line-height:1.5;">
                You received this email because you subscribed to HealthHere updates.
                <a href="${unsubscribeUrl}" style="color:#0f766e;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    const info = await t.sendMail({
        from: getFromAddress(),
        to,
        subject,
        html,
        headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
    })

    console.log('[mailer] Broadcast sent:', info.messageId, '→', to)
}

function consultationMeetingInviteTemplate(params: {
    recipientName: string
    meetUrl: string
    slotLabel: string
    otherPartyLabel: string
}): string {
    const appUrl = getAppUrl()

    return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family: Arial, Helvetica, sans-serif; background:#f4f4f4;">
  <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="600" cellspacing="0" cellpadding="0" role="presentation"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 28px;">
              <h1 style="margin:0 0 12px;color:#0f766e;font-size:22px;">Your consultation is scheduled</h1>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Hi ${params.recipientName},
              </p>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 8px;">
                <strong>When:</strong> ${params.slotLabel}
              </p>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                <strong>With:</strong> ${params.otherPartyLabel}
              </p>
              <a href="${params.meetUrl}"
                style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;">
                Join video meeting
              </a>
              <p style="margin-top:20px;color:#6b7280;font-size:14px;line-height:1.5;word-break:break-all;">
                Or copy this link: <a href="${params.meetUrl}" style="color:#0f766e;">${params.meetUrl}</a>
              </p>
              <p style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;line-height:1.5;">
                A calendar invite (.ics) is attached. Open it to add this appointment to your calendar.
                <br /><br />
                <a href="${appUrl}" style="color:#0f766e;">Visit HealthHere</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export async function sendConsultationMeetingInviteToGuest(params: {
    meetUrl: string
    slotLabel: string
    guestName: string
    guestEmail: string
    professionalName: string
    icsContent: string
    icsFilename: string
}): Promise<void> {
    const t = getTransporter()
    const subject = `HealthHere consultation — ${params.slotLabel}`
    const guestDisplay = params.guestName.trim() || params.guestEmail.split('@')[0] || 'there'
    const profDisplay =
        params.professionalName.trim() || 'your consultant'

    const icsAttachment = {
        filename: params.icsFilename,
        content: params.icsContent,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    }

    await t.sendMail({
        from: getFromAddress(),
        to: params.guestEmail,
        subject,
        html: consultationMeetingInviteTemplate({
            recipientName: guestDisplay,
            meetUrl: params.meetUrl,
            slotLabel: params.slotLabel,
            otherPartyLabel: profDisplay,
        }),
        attachments: [icsAttachment],
    })

    console.log('[mailer] Consultation invite sent to patient →', params.guestEmail)
}

export async function sendConsultationMeetingInviteToProfessional(params: {
    meetUrl: string
    slotLabel: string
    guestName: string
    professionalEmail: string
    icsContent: string
    icsFilename: string
}): Promise<void> {
    const t = getTransporter()
    const subject = `HealthHere consultation — ${params.slotLabel}`
    const guestDisplay = params.guestName.trim() || 'the patient'
    const profDisplay = params.professionalEmail.split('@')[0] || 'there'

    const icsAttachment = {
        filename: params.icsFilename,
        content: params.icsContent,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    }

    await t.sendMail({
        from: getFromAddress(),
        to: params.professionalEmail,
        subject,
        html: consultationMeetingInviteTemplate({
            recipientName: profDisplay,
            meetUrl: params.meetUrl,
            slotLabel: params.slotLabel,
            otherPartyLabel: guestDisplay,
        }),
        attachments: [icsAttachment],
    })

    console.log('[mailer] Consultation invite sent to consultant →', params.professionalEmail)
}

/** Sends both invites (used when not stepping through the admin progress dialog). */
export async function sendConsultationMeetingInviteEmails(params: {
    meetUrl: string
    slotLabel: string
    guestName: string
    guestEmail: string
    professionalName: string
    professionalEmail: string
    icsContent: string
    icsFilename: string
}): Promise<void> {
    await sendConsultationMeetingInviteToGuest({
        meetUrl: params.meetUrl,
        slotLabel: params.slotLabel,
        guestName: params.guestName,
        guestEmail: params.guestEmail,
        professionalName: params.professionalName,
        icsContent: params.icsContent,
        icsFilename: params.icsFilename,
    })
    await sendConsultationMeetingInviteToProfessional({
        meetUrl: params.meetUrl,
        slotLabel: params.slotLabel,
        guestName: params.guestName,
        professionalEmail: params.professionalEmail,
        icsContent: params.icsContent,
        icsFilename: params.icsFilename,
    })
}
