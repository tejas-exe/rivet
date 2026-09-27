"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { COLORS } from "@/data/colors";
import { formatINR } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { CartLine, CartThumb } from "./CartLine";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const lastAddedId = useUI((s) => s.lastAddedId);
  const close = useUI((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const pathname = usePathname();
  const added = lastAddedId ? items.find((i) => i.id === lastAddedId) : undefined;
  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  useEffect(() => close(), [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="absolute top-0 right-0 flex h-full w-full max-w-[460px] flex-col border-l border-line bg-coal"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
          >
            <header className="flex h-16 items-center justify-between border-b border-line px-5">
              <p className="label text-bone">
                Your Garage <span className="text-mute">({cartCount(items)})</span>
              </p>
              <button onClick={close} aria-label="Close cart" className="grid h-10 w-10 place-items-center hover:text-volt">
                <X size={20} />
              </button>
            </header>

            {added && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="relative overflow-hidden border-b border-line bg-ink px-5 py-5"
              >
                <motion.div
                  className="absolute inset-y-0 left-0 w-1 bg-volt"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
                <p className="label mb-4 flex items-center gap-2 text-volt">
                  <Check size={13} strokeWidth={3} /> Added to your garage
                </p>
                <div className="flex gap-4">
                  <CartThumb item={added} className="h-24 w-20" />
                  <dl className="grid flex-1 grid-cols-[auto_1fr] content-start gap-x-4 gap-y-1.5 font-mono text-[11px] uppercase">
                    <dt className="text-mute">Product</dt>
                    <dd className="truncate text-right text-bone">{added.custom ? `Custom ${added.name}` : added.name}</dd>
                    <dt className="text-mute">Color</dt>
                    <dd className="text-right">{COLORS[added.color].name}</dd>
                    <dt className="text-mute">Size</dt>
                    <dd className="text-right">{added.size}</dd>
                    <dt className="text-mute">Price</dt>
                    <dd className="text-right text-volt">{formatINR(added.unitPrice)}</dd>
                  </dl>
                </div>
              </motion.div>
            )}

            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="display mb-3 text-3xl">Garage empty</p>
                  <p className="mb-8 max-w-[260px] text-sm text-mute">Nothing built yet. Start a custom piece or browse the collection.</p>
                  <div className="flex flex-col gap-3">
                    <ButtonLink href="/customize" icon={<ArrowRight size={14} />}>
                      Start customizing
                    </ButtonLink>
                    <ButtonLink href="/shop" variant="ghost">
                      Shop collection
                    </ButtonLink>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {[...items].reverse().map((item) => (
                    <CartLine key={item.id} item={item} compact />
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-line bg-ink px-5 pt-4 pb-5">
                <div className="mb-4">
                  <p className="label mb-2 text-mute">
                    {remaining > 0 ? (
                      <>
                        <span className="text-bone">{formatINR(remaining)}</span> away from free shipping
                      </>
                    ) : (
                      <span className="text-volt">Free standard shipping unlocked</span>
                    )}
                  </p>
                  <div className="h-[3px] bg-steel">
                    <motion.div
                      className="h-full bg-volt"
                      initial={false}
                      animate={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="label text-mute">Subtotal</span>
                  <span className="font-wide text-2xl font-black tabular-nums">{formatINR(subtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ButtonLink href="/cart" variant="ghost">
                    View cart
                  </ButtonLink>
                  <ButtonLink href="/checkout" icon={<ArrowRight size={14} />}>
                    Checkout
                  </ButtonLink>
                </div>
                <Button variant="dark" block className="mt-2 border-transparent bg-transparent text-mute hover:text-bone" onClick={close}>
                  Continue shopping
                </Button>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
