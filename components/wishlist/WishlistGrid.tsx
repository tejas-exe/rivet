"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Wand2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GarmentImage } from "@/components/garment/GarmentImage";
import { useHydrated } from "@/components/layout/StoreHydrator";
import { useShopActions } from "@/components/product/useShopActions";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";
import { COLORS } from "@/data/colors";
import { getProduct } from "@/data/products";
import { formatINR } from "@/lib/format";
import type { ColorId, Product, Size } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/store/wishlist";

function WishlistItem({ product }: { product: Product }) {
  const [color, setColor] = useState<ColorId>(product.colors[0]);
  const [size, setSize] = useState<Size | null>(null);
  const [picking, setPicking] = useState(false);
  const remove = useWishlist((s) => s.remove);
  const { addToCart } = useShopActions();

  return (
    <motion.article layout exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col border border-line bg-coal">
      <Link href={`/product/${product.slug}?color=${color}`} className="relative block aspect-[4/5] bg-char">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(255,255,255,0.1),transparent_60%)]" />
        <GarmentImage silhouette={product.silhouette} color={color} className="absolute inset-[7%] h-[86%] w-[86%]" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex justify-between gap-3">
          <Link href={`/product/${product.slug}`} className="font-wide text-sm font-bold uppercase hover:text-volt">{product.name}</Link>
          <span className="font-mono text-sm">{formatINR(product.basePrice)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {product.colors.map((c) => (
            <button key={c} aria-label={COLORS[c].name} onClick={() => setColor(c)} className={cn("p-[3px] ring-1", c === color ? "ring-bone" : "ring-transparent")}>
              <span className="block h-3.5 w-3.5" style={{ background: COLORS[c].swatch }} />
            </button>
          ))}
          <span className="label text-fog">{COLORS[color].name}</span>
        </div>
        <AnimatePresence>
          {picking && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <p className="label mt-4 mb-2 text-mute">Pick a size</p>
              <div className="grid grid-cols-5 gap-1">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={cn("h-9 border font-mono text-xs", size === s ? "border-volt bg-volt text-ink" : "border-line-strong")}>{s}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-auto grid grid-cols-2 gap-1.5 pt-4">
          <button
            onClick={() => {
              if (!picking) return setPicking(true);
              if (!size) return;
              addToCart(product, color, size);
              setPicking(false);
              setSize(null);
            }}
            disabled={picking && !size}
            className="label col-span-2 flex h-11 items-center justify-center gap-2 bg-bone font-bold text-ink hover:bg-volt disabled:opacity-50"
          >
            <ShoppingBag size={14} /> {picking ? (size ? `Add ${size} to cart` : "Select size") : "Add to cart"}
          </button>
          <Link href={`/customize/${product.slug}?color=${color}`} className="label flex h-10 items-center justify-center gap-1.5 border border-line-strong hover:border-volt hover:text-volt">
            <Wand2 size={13} /> Customize
          </Link>
          <button onClick={() => remove(product.slug)} className="label flex h-10 items-center justify-center gap-1.5 border border-line-strong text-mute hover:border-alert hover:text-alert">
            <X size={13} /> Remove
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function WishlistGrid() {
  const hydrated = useHydrated();
  const slugs = useWishlist((s) => s.slugs);
  const products = slugs.map(getProduct).filter((p): p is Product => Boolean(p));

  if (!hydrated) return <div className="h-80 animate-pulse bg-coal" />;
  if (products.length === 0)
    return (
      <EmptyState
        title="No saved pieces"
        body="Tap the heart on any product to save it here for later."
        action={<ButtonLink href="/shop" icon={<ArrowRight size={14} />}>Browse the collection</ButtonLink>}
      />
    );
  return (
    <motion.div layout className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence>
        {products.map((p) => (
          <WishlistItem key={p.slug} product={p} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
