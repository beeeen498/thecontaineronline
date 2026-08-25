"use server";

// ─── Create Hyp Pay Payment Session ──────────────────────────
// Server-side only — never expose API credentials to client
// Calls Hyp Pay APISign endpoint and returns the payment page URL

const HYP_BASE_URL = "https://pay.hyp.co.il/p/";
const TERMINAL = process.env.HYP_TERMINAL_NUMBER;
const API_KEY = process.env.HYP_API_KEY;
const PASS_P = process.env.HYP_PASS_P;

export async function createHypPayment({
  amount,
  orderId,
  customerName,
  customerLastName,
  customerEmail,
  customerPhone,
  language,
}) {
  const isHebrew = language === "Hebrew";

  try {
    // ─── Build APISign request URL ────────────────────────
    const params = new URLSearchParams({
      action: "APISign",
      What: "SIGN",
      Sign: "True",
      Masof: TERMINAL,
      KEY: API_KEY,
      PassP: PASS_P,
      Amount: amount.toString(),
      Coin: isHebrew ? "1" : "2", // 1=ILS, 2=USD
      Order: orderId,
      PageLang: isHebrew ? "HEB" : "ENG",
      sendemail: "True",
      tmp: "2",
      SuccessUrl: "https://thecontaineronline.com/checkout/success",
      ErrorUrl: "https://thecontaineronline.com/checkout/success",
    });

    // ─── Call Hyp Pay APISign endpoint ────────────────────
    const response = await fetch(`${HYP_BASE_URL}?${params.toString()}`);
    const responseText = await response.text();
    console.log("Hyp response:", responseText);

    if (!response.ok) {
      return { success: false, error: "Failed to create payment session" };
    }

    // ─── Build payment page URL from response ─────────────
    // Response is a query string — append to base URL
    const paymentUrl = `${HYP_BASE_URL}?${responseText}`;

    return { success: true, paymentUrl };
  } catch (error) {
    console.error("Hyp Pay error:", error);
    return { success: false, error: error.message };
  }
}
