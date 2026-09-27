"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_ADDRESSES, MOCK_PROFILE } from "@/data/account";
import type { Address } from "@/lib/types";
import { uid } from "@/lib/utils";
import { safeStorage } from "./storage";

export type Profile = typeof MOCK_PROFILE;

interface AccountState {
  profile: Profile;
  addresses: Address[];
  updateProfile: (patch: Partial<Profile>) => void;
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      profile: MOCK_PROFILE,
      addresses: MOCK_ADDRESSES,
      updateProfile: (patch) => set({ profile: { ...get().profile, ...patch } }),
      addAddress: (a) => {
        const address = { ...a, id: uid("addr") };
        const list = a.isDefault ? get().addresses.map((x) => ({ ...x, isDefault: false })) : get().addresses;
        set({ addresses: [...list, { ...address, isDefault: a.isDefault || list.length === 0 }] });
      },
      removeAddress: (id) => {
        const remaining = get().addresses.filter((a) => a.id !== id);
        if (remaining.length && !remaining.some((a) => a.isDefault)) remaining[0] = { ...remaining[0], isDefault: true };
        set({ addresses: remaining });
      },
      setDefault: (id) => set({ addresses: get().addresses.map((a) => ({ ...a, isDefault: a.id === id })) }),
    }),
    { name: "rivet-account", storage: safeStorage, skipHydration: true },
  ),
);
