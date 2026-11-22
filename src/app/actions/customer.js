"use server";

import { cookies } from "next/headers";
import {
  customerCreate,
  customerAccessTokenCreate,
  customerAccessTokenDelete,
  getCustomer,
  customerDelete,
  customerUpdate,
} from "@/lib/shopifyQueries";

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
export async function deleteCustomerAccount() {
  const token = await readToken();
  if (!token) return { success: false };
  try {
    const customer = await getCustomer(token);
    if (!customer) return { success: false };
    const result = await customerDelete(customer.id, token);
    const error = firstError(result.userErrors);
    if (error) return { success: false, error };
    await clearTokenCookie();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
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

    if (newPassword) {
      if (!isString(currentPassword, 200) || !isString(newPassword, 200)) {
        return { success: false, error: "current_password_wrong" };
      }
      const verify = await customerAccessTokenCreate({
        email: customer.email,
        password: currentPassword,
      });
      if (firstError(verify.customerUserErrors) || !verify.customerAccessToken) {
        return { success: false, error: "current_password_wrong" };
      }
      // the verification token isn't needed — revoke it
      try {
        await customerAccessTokenDelete(verify.customerAccessToken.accessToken);
      } catch {}
    }

    const input = {};
    if (isString(email, 200)) input.email = email;
    if (newPassword) input.password = newPassword;

    const result = await customerUpdate(token, input);
    const error = firstError(result.customerUserErrors);
    if (error) return { success: false, error };

    if (result.customerAccessToken?.accessToken) {
      await setTokenCookie(result.customerAccessToken);
    }
    return { success: true, customer: { ...customer, ...result.customer } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
