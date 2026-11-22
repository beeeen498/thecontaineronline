// ─── Emails to the shop (server only) ─────────────────────────
// Not a server action — only callable from server code, so it can't
// be used to send arbitrary emails from the browser.
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.CONTACT_FROM_EMAIL || "The Container <onboarding@resend.dev>";
const SHOP_EMAIL = "thecontaineronline@gmail.com";

export async function sendShopEmail({ subject, text, replyTo }) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: SHOP_EMAIL,
    replyTo,
    subject,
    text,
  });
  if (error) throw new Error(error.message);
}
