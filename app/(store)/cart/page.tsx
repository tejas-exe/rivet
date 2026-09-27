"use client";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { CartLine } from "@/components/cart/CartLine";
import { useHydrated } from "@/components/layout/StoreHydrator";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState, PageHero } from "@/components/ui/misc";
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

  return (
    <>
      <PageHero eyebrow={hydrated ? `${cartCount(items)} items in your garage` : "Your garage"} title="Cart" />
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
          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            <div>
              <div className="label flex justify-between border-b border-line pb-3 text-fog">
                <span>Product</span>
                <button onClick={clear} className="hover:text-alert">Clear cart</button>
              </div>
              <div className="divide-y divide-line border-b border-line">
                {items.map((item) => (
                  <CartLine key={item.id} item={item} />
                ))}
              </div>
              <Link href="/shop" className="label mt-6 inline-flex items-center gap-2 text-bone-dim hover:text-volt">
                ← Continue shopping
              </Link>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="border border-line bg-coal p-6">
                <p className="label mb-6 text-bone">Order summary</p>
                <dl className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
                  {printing > 0 && (
                    <div className="flex justify-between text-xs"><dt className="text-fog">— incl. custom printing</dt><dd className="text-fog">{formatINR(printing)}</dd></div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-mute">Shipping</dt>
                    <dd>{shipping === 0 ? <span className="text-volt">Free</span> : formatINR(shipping)}</dd>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-fog">Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free standard shipping.</p>
                  )}
                </dl>
                <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
                  <span className="label text-mute">Total</span>
                  <span className="font-wide text-3xl font-black">{formatINR(subtotal + shipping)}</span>
                </div>
                <ButtonLink href="/checkout" size="lg" block className="mt-6" icon={<ArrowRight size={15} />}>
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
