"use server";

export async function createHypPayment({ amount, orderId, language }) {
  console.log("TEST called");
  return { success: false, error: "test" };
}
