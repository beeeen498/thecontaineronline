"use server";

import { cookies } from "next/headers";
import {
  customerCreate,
  customerAccessTokenCreate,
  customerAccessTokenDelete,
  getCustomer,
  customerUpdate,
} from "@/lib/shopifyQueries";
import { deleteCustomer } from "@/lib/shopifyAdmin";
import { sendShopEmail } from "@/lib/email";

// ─── Customer session (server only) ───────────────────────────
// The Shopify customer access token lives in an httpOnly cookie, so
// page scripts (including third-party widgets) can never read it.

const COOKIE = "customer_token";

async function setTokenCookie({ accessToken, expiresAt }) {
  (await cookies()).set(COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt ? new Date(expiresAt) : undefined,
  });
}

async function readToken() {
  return (await cookies()).get(COOKIE)?.value || null;
}

async function clearTokenCookie() {
  (await cookies()).delete(COOKIE);
}

function firstError(errors) {
  return errors?.length ? errors[0].message : null;
}

function isString(value, max = 500) {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

// ─── Current customer (null when logged out) ─────────────────
export async function getCurrentCustomer() {
  const token = await readToken();
  if (!token) return null;
  try {
    const customer = await getCustomer(token);
    if (!customer) await clearTokenCookie(); // expired or revoked
    return customer || null;
  } catch {
    return null;
  }
}

// ─── Move an old localStorage token into the cookie (one time) ──
export async function adoptLegacyToken(token) {
  if (!isString(token, 200)) return null;
  try {
    const customer = await getCustomer(token);
    if (!customer) return null;
    await setTokenCookie({ accessToken: token });
    return customer;
  } catch {
    return null;
  }
}

// ─── Login ────────────────────────────────────────────────────
export async function loginCustomer({ email, password } = {}) {
  if (!isString(email, 200) || !isString(password, 200)) {
    return { success: false, error: "Login failed" };
  }
  try {
    const result = await customerAccessTokenCreate({ email, password });
    const error = firstError(result.customerUserErrors);
    if (error || !result.customerAccessToken) {
      return { success: false, error: error || "Login failed" };
    }
    await setTokenCookie(result.customerAccessToken);
    const customer = await getCustomer(result.customerAccessToken.accessToken);
    return { success: true, customer };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── Register (then log in) ──────────────────────────────────
export async function registerCustomer({ firstName, lastName, email, password } = {}) {
  if (
    !isString(firstName, 100) ||
    !isString(lastName, 100) ||
    !isString(email, 200) ||
    !isString(password, 200)
  ) {
    return { success: false, error: "Registration failed" };
  }
  try {
    const created = await customerCreate({ firstName, lastName, email, password });
    const error = firstError(created.customerUserErrors);
    if (error) return { success: false, error };
    const login = await loginCustomer({ email, password });
    return login.success ? login : { success: false, error: "Registration failed" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── Logout ───────────────────────────────────────────────────
export async function logoutCustomer() {
  const token = await readToken();
  if (token) {
    try {
      await customerAccessTokenDelete(token);
    } catch {}
  }
  await clearTokenCookie();
  return { success: true };
}

// ─── Delete account ──────────────────────────────────────────
// No orders → deleted in Shopify (Admin API) and logged out.
// Has orders → Shopify won't delete it (and order records must be
// kept), so the shop is emailed a deletion request instead.
// Returns { success } or { success: false, requested: true }.
async function requestDeletion(customer) {
  await sendShopEmail({
    subject: `Account deletion request: ${customer.email}`,
    replyTo: customer.email,
    text: [
      "A customer asked to delete their account on the website.",
      "",
      `Name: ${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
      `Email: ${customer.email}`,
      `Shopify customer ID: ${customer.id}`,
      "",
      "They have orders, so Shopify can't delete the account automatically.",
      "To handle it: Shopify Admin → Customers → open this customer →",
      "⋯ (More actions) → Erase personal data.",
      "Orders are kept for your records; personal details are removed.",
    ].join("\n"),
  });
}

export async function deleteCustomerAccount() {
  const token = await readToken();
  if (!token) return { success: false };
  try {
    const customer = await getCustomer(token);
    if (!customer) return { success: false };

    const hasOrders = (customer.orders?.edges?.length || 0) > 0;
    if (!hasOrders) {
      const result = await deleteCustomer(customer.id);
      if (result.deleted) {
        await clearTokenCookie();
        return { success: true };
      }
      console.error("Customer delete refused:", result.error);
    }

    // has orders, or Shopify refused → ask the shop to handle it
    await requestDeletion(customer);
    return { success: false, requested: true };
  } catch (err) {
    console.error("Delete account error:", err.message);
    return { success: false };
  }
}

// ─── Update email and/or password ────────────────────────────
// Changing the password requires the current password.
export async function updateCurrentCustomer({ email, currentPassword, newPassword } = {}) {
  const token = await readToken();
  if (!token) return { success: false };
  try {
    const customer = await getCustomer(token);
    if (!customer) return { success: false };

    const input = {};
    if (isString(email, 200) && email !== customer.email) input.email = email;
    if (newPassword) {
      if (!isString(newPassword, 200)) return { success: false };
      input.password = newPassword;
    }
    if (!input.email && !input.password) return { success: false };

    // ─── Changing email or password needs the current password ──
    if (!isString(currentPassword, 200)) {
      return { success: false, error: "current_password_wrong" };
    }
    const verify = await customerAccessTokenCreate({
      email: customer.email,
      password: currentPassword,
    });
    if (firstError(verify.customerUserErrors) || !verify.customerAccessToken) {
      return { success: false, error: "current_password_wrong" };
    }
    // Don't revoke the verification token: Shopify returns the SAME token
    // the customer is already logged in with, so revoking it logs them out.

    const result = await customerUpdate(token, input);
    const error = firstError(result.customerUserErrors);
    if (error) return { success: false, error };

    // ─── Keep the customer logged in ─────────────────────────
    // Shopify revokes the old token when the email changes and doesn't
    // always return a new one, so log in again with the new details.
    if (result.customerAccessToken?.accessToken) {
      await setTokenCookie(result.customerAccessToken);
    } else {
      const relogin = await customerAccessTokenCreate({
        email: input.email || customer.email,
        password: input.password || currentPassword,
      });
      if (relogin.customerAccessToken) {
        await setTokenCookie(relogin.customerAccessToken);
      } else {
        await clearTokenCookie(); // updated, but must log in again
      }
    }
    return { success: true, customer: { ...customer, ...result.customer } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
