import type { Metadata } from "next";
import { ShopView } from "@/components/shop/ShopView";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return <ShopView />;
}
