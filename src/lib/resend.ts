import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY || 're_dummy_key_for_build'
export const resend = new Resend(resendApiKey)

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is missing. Email not sent.')
      return null
  }
  
  try {
    const data = await resend.emails.send({
      from: 'Golf Charity <no-reply@golfcharity.com>',
      to,
      subject,
      html,
    })
    return data
  } catch (error) {
    console.error('Email sending error:', error)
    return null
  }
}
