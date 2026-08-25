"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  createCart,
  addCartLine,
  updateCartLine,
  removeCartLine,
  getCart,
} from "@/lib/shopifyQueries";
import { getAllProducts } from "@/lib/shopifyQueries";

// ─── Cart Context ───────────────────────────────────────────────
const CartContext = createContext();

const CART_ID_KEY = "shopify-cart-id";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [products, setProducts] = useState([]);

  // ─── Load existing cart from localStorage on mount ────
  useEffect(() => {
    // ─── Fetch all products for cart display ──────────────
    getAllProducts().then(setProducts).catch(console.error);

    const savedCartId = localStorage.getItem(CART_ID_KEY);
    if (!savedCartId) return;

    setIsLoading(true);
    getCart(savedCartId)
      .then((fetchedCart) => {
        if (fetchedCart) {
          setCart(fetchedCart);
        } else {
          localStorage.removeItem(CART_ID_KEY);
        }
      })
      .catch(() => localStorage.removeItem(CART_ID_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  // ─── Add item to cart ──────────────────────────────────
  const addToCart = useCallback(
    async (variantId, quantity = 1) => {
      setIsLoading(true);
      try {
        let updatedCart;
        if (cart?.id) {
          updatedCart = await addCartLine(cart.id, variantId, quantity);
        } else {
          updatedCart = await createCart(variantId, quantity);
          localStorage.setItem(CART_ID_KEY, updatedCart.id);
        }
        setCart(updatedCart);

        // small delay so the cart icon bounce is visible before drawer opens
        setTimeout(() => setIsDrawerOpen(true), 400);
      } catch (error) {
        console.error("Error adding to cart:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
  );

  // ─── Update quantity — returns whether Shopify capped it ────
  const updateQuantity = useCallback(
    async (lineId, requestedQuantity) => {
      if (!cart?.id) return { maxedOut: false };
      setIsLoading(true);
      try {
        const updatedCart = await updateCartLine(
          cart.id,
          lineId,
          requestedQuantity,
        );
        setCart(updatedCart);

        const updatedLine = updatedCart.lines.edges.find(
          ({ node }) => node.id === lineId,
        );
        const actualQuantity = updatedLine?.node?.quantity ?? requestedQuantity;

        return { maxedOut: actualQuantity < requestedQuantity };
      } catch (error) {
        console.error("Error updating cart:", error);
        return { maxedOut: false };
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
  );

  // ─── Remove item ────────────────────────────────────────
  const removeItem = useCallback(
    async (lineId) => {
      if (!cart?.id) return;
      setIsLoading(true);
      try {
        const updatedCart = await removeCartLine(cart.id, lineId);
        setCart(updatedCart);
      } catch (error) {
        console.error("Error removing from cart:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
  );

  // ─── Clear cart ───────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setCart(null);
    localStorage.removeItem(CART_ID_KEY);
  }, []);

  // ─── Drawer controls ────────────────────────────────────
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        cart,
        products,
        isLoading,
        isDrawerOpen,
        addToCart,
        updateQuantity,
        removeItem,
        openDrawer,
        closeDrawer,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── useCart Hook ───────────────────────────────────────────────
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
