import { Suspense } from "react";
import { OrdersView } from "@/components/account/AccountViews";

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersView />
    </Suspense>
  );
}
