import { createJSONStorage } from "zustand/middleware";

/** localStorage that never throws (private mode, quota exceeded, SSR). */
export const safeStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      window.localStorage.setItem(name, value);
    } catch (err) {
      console.warn(`[rivet] Could not persist "${name}" — storage may be full.`, err);
    }
  },
  removeItem: (name: string) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
}));
