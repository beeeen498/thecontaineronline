// ─── Cloudflare Turnstile: server-side check (server only) ────
// Confirms the "are you human" token from the contact form with
// Cloudflare. Keys come from Cloudflare → Turnstile → your widget:
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY  (browser, shows the widget)
//   TURNSTILE_SECRET_KEY            (server, verifies the token)
// Without the secret the check is skipped, so the form still works
// before the keys are set (the honeypot + rate limit still apply).

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

// Returns true when the token is genuine (or Turnstile isn't set up).
export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Turnstile verify HTTP", response.status);
      return false;
    }
    const result = await response.json();
    if (!result.success) {
      console.error("Turnstile refused:", (result["error-codes"] || []).join(", "));
    }
    return result.success === true;
  } catch (error) {
    console.error("Turnstile verify error:", error.message);
    return false;
  }
}
