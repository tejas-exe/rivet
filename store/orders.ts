"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/lib/types";
import { safeStorage } from "./storage";

interface OrdersState {
  orders: Order[];
  add: (order: Order) => void;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (order) => set({ orders: [order, ...get().orders] }),
    }),
    { name: "rivet-orders", storage: safeStorage, skipHydration: true },
  ),
);
