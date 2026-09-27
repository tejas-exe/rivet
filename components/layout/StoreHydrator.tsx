"use client";
import { useEffect } from "react";
import { COLORS } from "@/data/colors";
import { DEFAULT_BUILD, getProduct } from "@/data/products";
import type { CartItem, ColorId } from "@/lib/types";
import { useAccount } from "@/store/account";
import { useCart } from "@/store/cart";
import { useCustomizer } from "@/store/customizer";
import { useOrders } from "@/store/orders";
import { usePrefs, useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

/**
 * Persisted stores skip automatic hydration so server HTML and the first
 * client render match; we rehydrate once after mount, then flag the app.
 */
export function StoreHydrator() {
  useEffect(() => {
    void Promise.all([
      useCart.persist.rehydrate(),
      useWishlist.persist.rehydrate(),
      useCustomizer.persist.rehydrate(),
      useOrders.persist.rehydrate(),
      useAccount.persist.rehydrate(),
      usePrefs.persist.rehydrate(),
    ]).then(() => {
      sanitizeSavedState();
      useUI.setState({ hydrated: true });
    });
  }, []);
  return null;
}

/** Saved state from older builds may reference products or colours no longer sold. */
function sanitizeSavedState() {
  const cartItems = useCart.getState().items;
  if (cartItems.some((i) => !getProduct(i.productSlug))) useCart.setState({ items: cartItems.filter((i) => getProduct(i.productSlug)) });
  const slugs = useWishlist.getState().slugs;
  if (slugs.some((s) => !getProduct(s))) useWishlist.setState({ slugs: slugs.filter((s) => getProduct(s)) });
  const draft = useCustomizer.getState();
  if (!getProduct(draft.productSlug)) {
    const cat = draft.productSlug.includes("hoodie") ? "hoodie" : "tshirt";
    useCustomizer.setState({ editingItemId: null });
    draft.setProduct(DEFAULT_BUILD[cat]);
  }

  const valid = (c: string): c is ColorId => c in COLORS;
  const fixItem = (i: CartItem): CartItem => (valid(i.color) ? i : { ...i, color: "black" });
  const cart = useCart.getState().items;
  if (cart.some((i) => !valid(i.color))) useCart.setState({ items: cart.map(fixItem) });
  const orders = useOrders.getState().orders;
  if (orders.some((o) => o.items.some((i) => !valid(i.color)))) useOrders.setState({ orders: orders.map((o) => ({ ...o, items: o.items.map(fixItem) })) });
  if (!valid(useCustomizer.getState().color)) useCustomizer.setState({ color: "black" });
}

export const useHydrated = () => useUI((s) => s.hydrated);
