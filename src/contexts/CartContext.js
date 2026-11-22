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
  getProductsForVariants,
} from "@/lib/shopifyQueries";

// ─── Cart Context ───────────────────────────────────────────────
const CartContext = createContext();

const CART_ID_KEY = "shopify-cart-id";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  // true once the saved cart (if any) has been loaded
  const [isRestored, setIsRestored] = useState(false);

  // ─── Load existing cart from localStorage on mount ────
  // ─── Product details (Hebrew names, prices) for cart lines only ──
  // Refetched only when the set of variants in the cart changes.
  const variantKey = (cart?.lines?.edges || [])
    .map(({ node }) => node.merchandise?.id)
    .filter(Boolean)
    .sort()
    .join(",");

  useEffect(() => {
    if (!variantKey) return; // empty cart — nothing to look up
    let cancelled = false;
    getProductsForVariants(variantKey.split(","))
      .then((result) => {
        if (!cancelled) setProducts(result);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [variantKey]);

  // ─── Restore saved cart on mount ──────────────────────
  const restoreCart = useCallback(async (savedCartId) => {
    if (!savedCartId) {
      setIsRestored(true);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedCart = await getCart(savedCartId);
      if (fetchedCart) {
        setCart(fetchedCart);
      } else {
        localStorage.removeItem(CART_ID_KEY);
      }
    } catch {
      localStorage.removeItem(CART_ID_KEY);
    } finally {
      setIsLoading(false);
      setIsRestored(true);
    }
  }, []);

  useEffect(() => {
    let savedCartId = null;
    try {
      savedCartId = localStorage.getItem(CART_ID_KEY);
    } catch {}
    // Intentional: mark the cart as loading immediately so "Add to cart"
    // stays disabled until the saved cart is back (otherwise a click in
    // that moment would start a new, empty cart).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    restoreCart(savedCartId);
  }, [restoreCart]);

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
        isRestored,
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
