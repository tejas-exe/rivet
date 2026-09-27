"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";
import { uid } from "@/lib/utils";
import { safeStorage } from "./storage";

export type NewCartItem = Omit<CartItem, "id" | "addedAt">;

interface CartState {
  items: CartItem[];
  add: (item: NewCartItem) => CartItem;
  replace: (id: string, item: NewCartItem) => CartItem;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const sameStandardItem = (a: CartItem, b: NewCartItem) =>
  !a.custom && !b.custom && a.productSlug === b.productSlug && a.color === b.color && a.size === b.size;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const existing = get().items.find((i) => sameStandardItem(i, item));
        if (existing) {
          const merged = { ...existing, quantity: Math.min(10, existing.quantity + item.quantity), addedAt: Date.now() };
          set({ items: get().items.map((i) => (i.id === existing.id ? merged : i)) });
          return merged;
        }
        const created: CartItem = { ...item, id: uid("ci"), addedAt: Date.now() };
        set({ items: [...get().items, created] });
        return created;
      },
      replace: (id, item) => {
        const current = get().items.find((i) => i.id === id);
        if (!current) return get().add(item);
        const updated: CartItem = { ...item, quantity: current.quantity, id, addedAt: Date.now() };
        set({ items: get().items.map((i) => (i.id === id ? updated : i)) });
        return updated;
      },
      setQuantity: (id, quantity) =>
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(10, quantity)) } : i)),
        }),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    { name: "rivet-cart", storage: safeStorage, skipHydration: true, version: 1 },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
