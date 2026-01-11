import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('Missing RESEND_API_KEY - emails will be disabled');
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'Socrates <socrates@example.com>';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!resend) {
    console.log('Email would be sent:', { to, subject });
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
