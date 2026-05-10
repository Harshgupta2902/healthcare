import 'server-only'

import nodemailer, { type Transporter } from 'nodemailer'

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

/**
 * Newsletter welcome email template.
 * Returns the full HTML string. Kept separate so it is easy to tweak
 * without touching the send logic.
 */
function newsletterWelcomeTemplate(userName: string): string {
    const appUrl = process.env.APP_URL || 'https://healthhere.com'

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
                                        You can unsubscribe anytime by replying to this email.
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

    const info = await t.sendMail({
        from: getFromAddress(),
        to: userEmail,
        subject: 'Welcome to the HealthHere Newsletter 🎉',
        html: newsletterWelcomeTemplate(safeName),
    })

    console.log('[mailer] Newsletter email sent:', info.messageId)
}
