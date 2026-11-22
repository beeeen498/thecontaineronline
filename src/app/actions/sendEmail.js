'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';

// ─── Resend Client ────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// Set CONTACT_FROM_EMAIL once your own domain is verified in Resend,
// e.g. "The Container <contact@thecontaineronline.com>"
const FROM = process.env.CONTACT_FROM_EMAIL || 'The Container <onboarding@resend.dev>';
const TO = 'thecontaineronline@gmail.com';

// ─── Limits ───────────────────────────────────────────────────
const MAX = { fullName: 100, phone: 30, email: 200, message: 5000 };
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const PHONE_RE = /^[0-9+\-()\s]{6,30}$/;

// ─── Basic rate limit: 3 messages per 10 minutes per visitor ──
// In-memory, so it resets when the server restarts and is per
// server instance — enough to stop casual scripted spam.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const recent = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const hits = (recent.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(key, hits);
    return true;
  }
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear(); // keep memory bounded
  return false;
}

// ─── Helpers ──────────────────────────────────────────────────
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

// ─── Send Contact Email ───────────────────────────────────────
// `website` is a hidden honeypot field — real visitors leave it empty.
export async function sendContactEmail(input) {
  try {
    const data = input && typeof input === 'object' ? input : {};

    // ─── Bots fill hidden fields: pretend success, send nothing ──
    if (data.website) return { success: true };

    const fullName = clean(data.fullName, MAX.fullName);
    const phone = clean(data.phone, MAX.phone);
    const email = clean(data.email, MAX.email);
    const message = clean(data.message, MAX.message);

    if (!fullName || !message || !EMAIL_RE.test(email) || !PHONE_RE.test(phone)) {
      return { success: false, error: 'invalid' };
    }

    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return { success: false, error: 'rate_limited' };
    }

    const safe = {
      fullName: escapeHtml(fullName),
      phone: escapeHtml(phone),
      email: escapeHtml(email),
      message: escapeHtml(message).replace(/\n/g, '<br>'),
    };

    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `New message from ${fullName.replace(/[\r\n]+/g, ' ')}`,
      text: `Name: ${fullName}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safe.fullName}</p>
        <p><strong>Phone:</strong> ${safe.phone}</p>
        <p><strong>Email:</strong> ${safe.email}</p>
        <p><strong>Message:</strong></p>
        <p>${safe.message}</p>
      `,
    });

    if (error) {
      console.error('Error sending email:', error.message);
      return { success: false, error: 'send_failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, error: 'send_failed' };
  }
}
