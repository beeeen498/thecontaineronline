"use server";

const HYP_BASE_URL = "https://pay.hyp.co.il/p/";
const TERMINAL = process.env.HYP_TERMINAL_NUMBER;
const API_KEY = process.env.HYP_API_KEY;
const PASS_P = process.env.HYP_PASS_P;

export async function createHypPayment({ amount, orderId, language }) {
  const isHebrew = language === "Hebrew";

  console.log("Hyp credentials check:", {
    terminal: TERMINAL,
    hasKey: !!API_KEY,
    hasPass: !!PASS_P,
    amount,
  });

  try {
    const params = new URLSearchParams({
      action: "APISign",
      What: "SIGN",
      Sign: "True",
      Masof: TERMINAL,
      KEY: API_KEY,
      PassP: PASS_P,
      Amount: amount.toString(),
      Coin: isHebrew ? "1" : "2",
      Order: orderId,
      PageLang: isHebrew ? "HEB" : "ENG",
      sendemail: "True",
      tmp: "2",
      SuccessUrl: "https://thecontaineronline.com/checkout/success",
      ErrorUrl: "https://thecontaineronline.com/checkout/success",
    });

    console.log("Calling Hyp Pay URL:", `${HYP_BASE_URL}?${params.toString()}`);

    const response = await fetch(`${HYP_BASE_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });

    const responseText = await response.text();
    console.log("Hyp Pay response:", responseText);

    const paymentUrl = `${HYP_BASE_URL}?${responseText}`;
    return { success: true, paymentUrl };
  } catch (error) {
    console.error("Hyp Pay error:", error.message);
    return { success: false, error: error.message };
  }
}
