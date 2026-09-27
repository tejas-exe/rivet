"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sound } from "@/lib/sound";
import { safeStorage } from "./storage";

interface UIState {
  hydrated: boolean;
  cartOpen: boolean;
  lastAddedId: string | null;
  searchOpen: boolean;
  menuOpen: boolean;
  toast: { id: number; message: string } | null;
  openCart: (lastAddedId?: string | null) => void;
  closeCart: () => void;
  setSearch: (open: boolean) => void;
  setMenu: (open: boolean) => void;
  notify: (message: string) => void;
}

export const useUI = create<UIState>()((set) => ({
  hydrated: false,
  cartOpen: false,
  lastAddedId: null,
  searchOpen: false,
  menuOpen: false,
  toast: null,
  openCart: (lastAddedId = null) => set({ cartOpen: true, lastAddedId, searchOpen: false, menuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  setSearch: (searchOpen) => set({ searchOpen, menuOpen: false }),
  setMenu: (menuOpen) => set({ menuOpen }),
  notify: (message) => set({ toast: { id: Date.now(), message } }),
}));

/** Persisted user preferences. */
interface PrefsState {
  soundOn: boolean;
  toggleSound: () => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      soundOn: true,
      toggleSound: () => {
        const soundOn = !get().soundOn;
        sound.enabled = soundOn;
        set({ soundOn });
      },
    }),
    {
      name: "rivet-prefs",
      storage: safeStorage,
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) sound.enabled = state.soundOn;
      },
    },
  ),
);
