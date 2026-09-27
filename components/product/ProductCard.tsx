"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Plus, Wand2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GarmentImage } from "@/components/garment/GarmentImage";
import { COLORS } from "@/data/colors";
import { CATEGORY_META } from "@/data/products";
import { formatINR } from "@/lib/format";
import type { ColorId, Product } from "@/lib/types";
import { cn, pad } from "@/lib/utils";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import { useShopActions } from "./useShopActions";

export function ProductCard({ product, index, initialColor }: { product: Product; index?: number; initialColor?: ColorId }) {
  const [color, setColor] = useState<ColorId>(
    initialColor && product.colors.includes(initialColor) ? initialColor : product.colors[0],
  );
  const [quickAdd, setQuickAdd] = useState(false);
  const hydrated = useUI((s) => s.hydrated);
  const wished = useWishlist((s) => s.slugs.includes(product.slug));
  const { addToCart, toggleWishlist } = useShopActions();
  const href = `/product/${product.slug}?color=${color}`;
  const discount = product.compareAtPrice ? Math.round((1 - product.basePrice / product.compareAtPrice) * 100) : 0;

  return (
    <article className="group/card relative flex flex-col" onMouseLeave={() => setQuickAdd(false)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-char">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,rgba(255,255,255,0.10),transparent_62%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          <div className="absolute inset-[6%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]">
            <GarmentImage
              silhouette={product.silhouette}
              color={color}
              view="front"
              className="absolute inset-0 h-full w-full transition-opacity duration-500 pointer-fine:group-hover/card:opacity-0"
            />
            <GarmentImage
              silhouette={product.silhouette}
              color={color}
              view="back"
              className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 pointer-fine:group-hover/card:opacity-100"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.isNew && <span className="label bg-bone px-1.5 py-0.5 text-[9.5px]! font-bold text-ink">New</span>}
          {discount > 0 && <span className="label bg-volt px-1.5 py-0.5 text-[9.5px]! font-bold text-ink">−{discount}%</span>}
        </div>
        {index !== undefined && <span className="label pointer-events-none absolute right-12 top-4 text-fog">{pad(index + 1)}</span>}

        <button
          onClick={() => toggleWishlist(product)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={hydrated && wished}
          className="absolute top-2 right-2 grid h-9 w-9 place-items-center text-bone transition-colors hover:text-volt"
        >
          <motion.span key={String(hydrated && wished)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            <Heart size={18} className={cn(hydrated && wished && "fill-volt text-volt")} />
          </motion.span>
        </button>

        {/* Quick actions */}
        <div className="absolute inset-x-2 bottom-2 flex translate-y-0 gap-1 transition-all duration-300 pointer-fine:translate-y-3 pointer-fine:opacity-0 pointer-fine:group-hover/card:translate-y-0 pointer-fine:group-hover/card:opacity-100 pointer-fine:group-focus-within/card:translate-y-0 pointer-fine:group-focus-within/card:opacity-100">
          <AnimatePresence mode="wait" initial={false}>
            {quickAdd ? (
              <motion.div
                key="sizes"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex flex-1 items-stretch bg-ink/90 backdrop-blur"
              >
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      addToCart(product, color, s);
                      setQuickAdd(false);
                    }}
                    className="label flex-1 py-3 text-bone transition-colors hover:bg-volt hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
                <button onClick={() => setQuickAdd(false)} aria-label="Cancel quick add" className="px-2.5 text-mute hover:text-bone">
                  <X size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.div key="actions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="flex flex-1 gap-1">
                <button
                  onClick={() => setQuickAdd(true)}
                  className="label flex flex-1 items-center justify-center gap-1.5 bg-bone py-3 font-bold text-ink transition-colors hover:bg-volt"
                >
                  <Plus size={13} strokeWidth={3} /> Quick add
                </button>
                <Link
                  href={`/customize/${product.slug}?color=${color}`}
                  className="label flex flex-1 items-center justify-center gap-1.5 bg-ink/85 py-3 font-bold text-bone backdrop-blur transition-colors hover:bg-volt hover:text-ink"
                >
                  <Wand2 size={13} /> Customize
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <p className="label mb-1.5 text-fog">{CATEGORY_META[product.category].label}</p>
          <Link href={href} className="font-wide text-[15px] leading-tight font-bold uppercase hover:text-volt">
            {product.name}
          </Link>
        </div>
        <div className="shrink-0 text-right font-mono text-sm">
          <p>{formatINR(product.basePrice)}</p>
          {product.compareAtPrice && <p className="text-xs text-fog line-through">{formatINR(product.compareAtPrice)}</p>}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2" role="radiogroup" aria-label="Color">
        {product.colors.map((c) => (
          <button
            key={c}
            role="radio"
            aria-checked={c === color}
            aria-label={COLORS[c].name}
            onClick={() => setColor(c)}
            className={cn("p-[3px] ring-1 transition-all", c === color ? "ring-bone" : "ring-transparent hover:ring-line-strong")}
          >
            <span className="block h-3.5 w-3.5" style={{ background: COLORS[c].swatch }} />
          </button>
        ))}
        <span className="label ml-1 text-fog">{COLORS[color].name}</span>
      </div>
    </article>
  );
}
