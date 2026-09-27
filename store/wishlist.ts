"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./storage";

interface WishlistState {
  slugs: string[];
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const has = get().slugs.includes(slug);
        set({ slugs: has ? get().slugs.filter((s) => s !== slug) : [slug, ...get().slugs] });
        return !has;
      },
      remove: (slug) => set({ slugs: get().slugs.filter((s) => s !== slug) }),
    }),
    { name: "rivet-wishlist", storage: safeStorage, skipHydration: true },
  ),
);
