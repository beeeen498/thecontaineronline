'use server';

import { Resend } from 'resend';

// ─── Resend Client ────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Send Contact Email ───────────────────────────────────────
export async function sendContactEmail({ fullName, phone, email, message }) {
  try {
    await resend.emails.send({
      from: 'The Container <onboarding@resend.dev>',
      to: 'thecontaineronline@gmail.com',
      subject: `New message from ${fullName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}