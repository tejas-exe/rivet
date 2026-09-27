"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { CartThumb, PrintSpecs } from "@/components/cart/CartLine";
import { useHydrated } from "@/components/layout/StoreHydrator";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState } from "@/components/ui/misc";
import { COLORS } from "@/data/colors";
import { formatDate, formatINR } from "@/lib/format";
import { useOrders } from "@/store/orders";

const PAYMENT_LABEL = { upi: "UPI", card: "Card", cod: "Cash on delivery" } as const;

export function OrderSuccess() {
  const number = useSearchParams().get("order");
  const hydrated = useHydrated();
  const order = useOrders((s) => s.orders.find((o) => o.number === number) ?? (number ? undefined : s.orders[0]));

  if (!hydrated) return <Container className="pt-40"><div className="h-96 animate-pulse bg-coal" /></Container>;
  if (!order)
    return (
      <Container className="pt-40">
        <EmptyState title="Order not found" body="We couldn't find that order on this device." action={<ButtonLink href="/shop">Continue shopping</ButtonLink>} />
      </Container>
    );

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[80vh] bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,255,46,0.14),transparent_60%)]" />
      <Container className="pt-36 pb-10 text-center md:pt-44">
        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 45 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="mx-auto mb-10 grid h-16 w-16 place-items-center border-2 border-volt">
          <span className="h-3 w-3 bg-volt" />
        </motion.div>
        <p className="label mb-5 text-volt">Order {`#${order.number}`}</p>
        <h1 className="display text-[clamp(3.2rem,11vw,10rem)]">
          {["Build", "confirmed."].map((w, i) => (
            <span key={w} className="block overflow-hidden">
              <motion.span className="block" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mx-auto mt-6 max-w-xl font-wide text-lg font-bold uppercase text-bone-dim">
          Your custom piece is ready for production.
        </motion.p>
        <p className="mt-3 text-sm text-mute">A confirmation has been sent to {order.email}.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/shop" size="lg" icon={<ArrowRight size={15} />}>Continue shopping</ButtonLink>
          <ButtonLink href={`/account/orders?order=${order.number}`} size="lg" variant="ghost">View order</ButtonLink>
        </div>
      </Container>

      <Container className="max-w-3xl! pb-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="border border-line bg-coal">
          <div className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
            {[
              ["Order", `#${order.number}`],
              ["Placed", formatDate(order.placedAt)],
              ["Payment", PAYMENT_LABEL[order.paymentMethod]],
              ["Delivery", order.shippingMethod === "express" ? "2–3 days" : "5–7 days"],
            ].map(([k, v]) => (
              <div key={k} className="bg-coal p-4">
                <p className="label text-fog">{k}</p>
                <p className="mt-1 font-mono text-sm">{v}</p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-line px-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 py-5">
                <CartThumb item={item} className="h-24 w-20" />
                <div className="flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="font-wide text-sm font-bold uppercase">{item.custom ? `Custom ${item.name}` : item.name}</p>
                    <p className="font-mono text-sm">{formatINR(item.unitPrice * item.quantity)}</p>
                  </div>
                  <p className="label mt-1 text-fog">{COLORS[item.color].name} / {item.size} · Qty {item.quantity}</p>
                  <PrintSpecs item={item} className="mt-2" />
                </div>
              </div>
            ))}
          </div>
          <dl className="space-y-2 border-t border-line px-6 py-5 font-mono text-sm">
            <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">Shipping</dt><dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd></div>
            {order.codFee > 0 && <div className="flex justify-between"><dt className="text-mute">COD fee</dt><dd>{formatINR(order.codFee)}</dd></div>}
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="label text-mute">Total paid</dt>
              <dd className="font-wide text-2xl font-black">{formatINR(order.total)}</dd>
            </div>
          </dl>
          <div className="border-t border-line px-6 py-5 text-sm text-mute">
            <p className="label mb-2 text-fog">Shipping to</p>
            {order.address.fullName}, {order.address.line1}, {order.address.city}, {order.address.state} {order.address.pin}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
