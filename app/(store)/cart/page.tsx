"use client";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { CartLine } from "@/components/cart/CartLine";
import { useHydrated } from "@/components/layout/StoreHydrator";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState, PageHero } from "@/components/ui/misc";
import { Barcode, TechnicalDivider } from "@/components/ui/street";
import { formatINR } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, shippingFor } from "@/lib/pricing";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";

export default function CartPage() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);
  const printing = items.reduce((n, i) => n + i.printingPrice * i.quantity, 0);
  const total = subtotal + shipping;

  return (
    <>
      <PageHero
        eyebrow={hydrated ? `${cartCount(items)} items in your garage` : "Your garage"}
        meta={hydrated ? `Builds / ${String(items.length).padStart(3, "0")}` : undefined}
        title={
          <>
            Your
            <br />
            <em>garage</em>
            <span className="text-volt">.</span>
          </>
        }
      />
      <Container className="py-12">
        {!hydrated ? (
          <div className="h-64 animate-pulse bg-coal" />
        ) : items.length === 0 ? (
          <EmptyState
            title="Your garage is empty"
            body="Build something custom in the studio or pick a blank from the collection."
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/customize" icon={<ArrowRight size={14} />}>Start customizing</ButtonLink>
                <ButtonLink href="/shop" variant="ghost">Shop collection</ButtonLink>
              </div>
            }
          />
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="label flex items-center justify-between border-b border-line pb-3 text-fog">
                <span>
                  <span className="text-volt">{String(items.length).padStart(2, "0")}</span> Saved builds
                </span>
                <button onClick={clear} className="hover:text-alert">
                  ✕ Clear garage
                </button>
              </div>
              <div className="divide-y divide-line border-b border-line">
                {items.map((item, i) => (
                  <CartLine key={item.id} item={item} index={i} />
                ))}
              </div>
              <Link href="/shop" className="group label mt-6 inline-flex items-center gap-2 text-bone-dim hover:text-volt">
                <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span> Continue shopping
              </Link>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="relative overflow-hidden bg-coal/80 p-6 backdrop-blur">
                <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-volt via-violet to-cyan" />
                <div className="mb-6 flex items-center justify-between">
                  <p className="display text-3xl">Order sheet</p>
                  <Barcode className="h-5 w-16" />
                </div>
                <dl className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between">
                    <dt className="label text-mute">Subtotal</dt>
                    <dd>{formatINR(subtotal)}</dd>
                  </div>
                  {printing > 0 && (
                    <div className="flex justify-between text-xs">
                      <dt className="text-fog">— incl. custom printing</dt>
                      <dd className="text-cyan">{formatINR(printing)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="label text-mute">Shipping</dt>
                    <dd>{shipping === 0 ? <span className="text-cyan">Free</span> : formatINR(shipping)}</dd>
                  </div>
                  {shipping > 0 && <p className="text-xs text-fog">Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free standard shipping.</p>}
                </dl>
                <TechnicalDivider className="mt-6" meta="Total" />
                <div className="mt-3 flex items-start justify-end gap-1.5">
                  <span className="display mt-1 text-3xl text-volt">₹</span>
                  <span className="display text-8xl leading-[0.85] tabular-nums">{formatINR(total).slice(1)}</span>
                </div>
                <ButtonLink href="/checkout" size="xl" block className="mt-6" icon={<ArrowRight size={16} />}>
                  Proceed to checkout
                </ButtonLink>
                <p className="label mt-4 flex items-center justify-center gap-2 text-fog">
                  <Lock size={11} /> Demo checkout — no payment taken
                </p>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </>
  );
}
