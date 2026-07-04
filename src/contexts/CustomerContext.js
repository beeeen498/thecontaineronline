'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  customerCreate,
  customerAccessTokenCreate,
  customerAccessTokenDelete,
  getCustomer,
  customerDelete,
} from '@/lib/shopifyQueries';

// ─── Customer Context ─────────────────────────────────────────
// Manages customer auth state across the app
// Stores access token in localStorage for persistence

const CustomerContext = createContext();

const TOKEN_KEY = 'shopify-customer-token';

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Load saved token on mount ────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) return;

    setIsLoading(true);
    getCustomer(savedToken)
      .then(data => {
        if (data) {
          setCustomer({ ...data, accessToken: savedToken });
        } else {
          // token expired or invalid
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  // ─── Register ─────────────────────────────────────────
  const register = useCallback(async ({ firstName, lastName, email, password }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await customerCreate({ firstName, lastName, email, password });

      if (result.customerUserErrors?.length > 0) {
        setError(result.customerUserErrors[0].message);
        return { success: false, error: result.customerUserErrors[0].message };
      }

      // auto-login after registration
      const loginResult = await customerAccessTokenCreate({ email, password });
      if (loginResult.customerAccessToken) {
        const { accessToken } = loginResult.customerAccessToken;
        localStorage.setItem(TOKEN_KEY, accessToken);
        const customerData = await getCustomer(accessToken);
        setCustomer({ ...customerData, accessToken });
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Login ────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await customerAccessTokenCreate({ email, password });

      if (result.customerUserErrors?.length > 0) {
        setError(result.customerUserErrors[0].message);
        return { success: false, error: result.customerUserErrors[0].message };
      }

      if (result.customerAccessToken) {
        const { accessToken } = result.customerAccessToken;
        localStorage.setItem(TOKEN_KEY, accessToken);
        const customerData = await getCustomer(accessToken);
        setCustomer({ ...customerData, accessToken });
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Logout ───────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (customer?.accessToken) {
        await customerAccessTokenDelete(customer.accessToken);
      }
      localStorage.removeItem(TOKEN_KEY);
      setCustomer(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [customer]);

  // ─── Delete Account ───────────────────────────────────
  const deleteAccount = useCallback(async () => {
    if (!customer?.id || !customer?.accessToken) return { success: false };
    setIsLoading(true);
    try {
      const result = await customerDelete(customer.id, customer.accessToken);

      if (result.userErrors?.length > 0) {
        return { success: false, error: result.userErrors[0].message };
      }

      localStorage.removeItem(TOKEN_KEY);
      setCustomer(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [customer]);

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
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}