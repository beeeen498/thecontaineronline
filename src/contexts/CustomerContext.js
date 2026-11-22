"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCurrentCustomer,
  adoptLegacyToken,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  deleteCustomerAccount,
  updateCurrentCustomer,
} from "@/app/actions/customer";

// ─── Customer Context ─────────────────────────────────────────
// Manages customer auth state across the app.
// The access token is kept in an httpOnly cookie by the server
// actions in src/app/actions/customer.js — never in the browser.

const CustomerContext = createContext();

// Old versions stored the token in localStorage; moved to the cookie once.
const LEGACY_TOKEN_KEY = "shopify-customer-token";

function takeLegacyToken() {
  try {
    const token = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (token) localStorage.removeItem(LEGACY_TOKEN_KEY);
    return token;
  } catch {
    return null;
  }
}

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Load the logged-in customer on mount ─────────────
  useEffect(() => {
    const legacyToken = takeLegacyToken();
    const load = legacyToken ? adoptLegacyToken(legacyToken) : getCurrentCustomer();
    load
      .then((data) => setCustomer(data || null))
      .catch(() => setCustomer(null))
      .finally(() => setIsLoading(false));
  }, []);

  // ─── Shared runner for actions that return { success, customer } ──
  const run = useCallback(async (action, args) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await action(args);
      if (result.success && result.customer) setCustomer(result.customer);
      if (!result.success && result.error) setError(result.error);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Register / Login ─────────────────────────────────
  const register = useCallback((input) => run(registerCustomer, input), [run]);
  const login = useCallback((input) => run(loginCustomer, input), [run]);

  // ─── Logout ───────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setCustomer(null);
      setIsLoading(false);
    }
  }, []);

  // ─── Delete Account ───────────────────────────────────
  const deleteAccount = useCallback(async () => {
    if (!customer) return { success: false };
    const result = await run(deleteCustomerAccount);
    if (result.success) setCustomer(null);
    return result;
  }, [customer, run]);

  // ─── Update Customer (email and/or password) ──────────
  const updateCustomer = useCallback(
    async (input) => {
      if (!customer) return { success: false };
      return run(updateCurrentCustomer, input);
    },
    [customer, run],
  );

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        isLoading,
        error,
        login,
        logout,
        register,
        deleteAccount,
        updateCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

// ─── useCustomer Hook ─────────────────────────────────────────
export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}
