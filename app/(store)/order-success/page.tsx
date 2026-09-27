import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccess } from "@/components/checkout/OrderSuccess";

export const metadata: Metadata = { title: "Build confirmed" };

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccess />
    </Suspense>
  );
}
