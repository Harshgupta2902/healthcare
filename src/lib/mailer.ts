import 'server-only'

import nodemailer, { type Transporter } from 'nodemailer'
import { createUnsubscribeToken } from '@/lib/newsletter-token'
import {
  buildEmailShell,
  emailDetailRow,
  emailHeading,
  emailInlineLink,
  emailList,
  emailParagraph,
  emailPrimaryButton,
  emailUnsubscribeFooter,
  escapeHtml,
  EMAIL,
} from '@/lib/email/brand-template'

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

function newsletterWelcomeTemplate(userName: string, unsubscribeUrl: string): string {
    const appUrl = getAppUrl()
    const safeName = escapeHtml(userName)

    const bodyHtml = `
      ${emailHeading(`Welcome, ${safeName} 👋`)}
      ${emailParagraph('Thanks for subscribing to our newsletter. We&rsquo;re excited to have you with us.')}
      ${emailParagraph('Here&rsquo;s what you can expect from us:')}
      ${emailList([
        'Latest health tips and articles',
        'Updates on new services and features',
        'Special offers and announcements',
      ])}
      ${emailPrimaryButton(appUrl, 'Visit HealthHere')}
    `

    return buildEmailShell({
        appUrl,
        bodyHtml,
        footerHtml: emailUnsubscribeFooter(unsubscribeUrl),
    })
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
        headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
    })

    console.log('[mailer] Newsletter email sent:', info.messageId)
}

/**
 * Admin broadcast: rich HTML from Lexical (body fragment) wrapped in branded shell
 * with a per-recipient one-click unsubscribe link and RFC 8058 headers.
 */
export async function sendNewsletterBroadcastEmail(
    to: string,
    subject: string,
    innerContentHtml: string
): Promise<void> {
    const t = getTransporter()
    const appUrl = getAppUrl()
    const unsubscribeUrl = buildUnsubscribeUrl(to)

    const bodyHtml = `
      <div style="font-family:'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#44474d;">
        ${innerContentHtml}
      </div>
    `

    const html = buildEmailShell({
        appUrl,
        bodyHtml,
        footerHtml: emailUnsubscribeFooter(
            unsubscribeUrl,
            'You received this email because you subscribed to HealthHere updates.'
        ),
    })

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

    const bodyHtml = `
      ${emailHeading('Your consultation is scheduled')}
      ${emailParagraph(`Hi ${escapeHtml(params.recipientName)},`)}
      ${emailDetailRow('When:', params.slotLabel)}
      ${emailDetailRow('With:', params.otherPartyLabel)}
      ${emailPrimaryButton(params.meetUrl, 'Join video meeting')}
      ${emailParagraph(
        `Or copy this link: ${emailInlineLink(params.meetUrl, params.meetUrl)}`
      )}
    `

    return buildEmailShell({
        appUrl,
        bodyHtml,
        footerHtml: `<p style="margin:0;font-family:'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#76849f;text-align:center;">
          A calendar invite (.ics) is attached &mdash; open it to add this appointment to your calendar.
          <br /><br />
          ${emailInlineLink(appUrl, 'Visit HealthHere')}
        </p>`,
    })
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

function registrationOtpTemplate(params: {
  recipientName: string
  otpCode: string
  expiryMinutes: number
}): string {
  const appUrl = getAppUrl()
  const safeName = escapeHtml(params.recipientName)
  const safeCode = escapeHtml(params.otpCode)

  const bodyHtml = `
      ${emailHeading('Verify your email')}
      ${emailParagraph(`Hi ${safeName},`)}
      ${emailParagraph('Use this verification code to complete your HealthHere account registration:')}
      <p style="margin:24px 0;font-family:${EMAIL.fontHeading};font-size:32px;font-weight:700;letter-spacing:0.28em;text-align:center;color:${EMAIL.brand};">
        ${safeCode}
      </p>
      ${emailParagraph(`This code expires in ${params.expiryMinutes} minutes. If you did not request this, you can ignore this email.`)}
      ${emailPrimaryButton(`${appUrl}/register`, 'Continue registration')}
    `

  return buildEmailShell({
    appUrl,
    bodyHtml,
    footerHtml: `<p style="margin:0;font-family:'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#76849f;text-align:center;">
          For your security, never share this code with anyone.
        </p>`,
  })
}

export async function sendRegistrationOtpEmail(params: {
  email: string
  recipientName: string
  otpCode: string
  expiryMinutes: number
}): Promise<void> {
  const t = getTransporter()
  const safeName = params.recipientName.trim() || params.email.split('@')[0] || 'there'

  const info = await t.sendMail({
    from: getFromAddress(),
    to: params.email,
    subject: `${params.otpCode} is your HealthHere verification code`,
    html: registrationOtpTemplate({
      recipientName: safeName,
      otpCode: params.otpCode,
      expiryMinutes: params.expiryMinutes,
    }),
  })

  console.log('[mailer] Registration OTP sent:', info.messageId, '→', params.email)
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
