"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart, Plus, Wand2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GarmentImage } from "@/components/garment/GarmentImage";
import { CornerFrame, StreetTag } from "@/components/ui/street";
import { COLORS } from "@/data/colors";
import { CATEGORY_META } from "@/data/products";
import { formatINR } from "@/lib/format";
import type { ColorId, Product } from "@/lib/types";
import { cn, pad } from "@/lib/utils";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import { useShopActions } from "./useShopActions";

/**
 * Editorial product card: no box — the lit product stage dominates, with
 * catalogue typography underneath. Hover brings up HUD brackets, swaps the
 * stage light from pink to cyan and slides in CUSTOMIZE →.
 */
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
  const n = index !== undefined ? pad(index + 1) : undefined;

  return (
    <article className="group/card relative flex flex-col" onMouseLeave={() => setQuickAdd(false)}>
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Stage lighting: pink at rest, cyan on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-char/70 via-coal/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_32%,rgb(255_46_147/0.16),transparent_70%)] transition-opacity duration-300 group-hover/card:opacity-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_32%,rgb(34_234_255/0.18),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 overflow-hidden opacity-30 transition-opacity duration-300 group-hover/card:opacity-60">
          <div className="floor-grid absolute inset-x-[-25%] top-0 h-[220%]" />
        </div>
        {n && (
          <span aria-hidden className="display text-outline pointer-events-none absolute -bottom-4 -left-1 text-[9rem] leading-none transition-transform duration-500 group-hover/card:-translate-y-2">
            {n}
          </span>
        )}

        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          <div className="absolute inset-[7%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:-translate-y-2 group-hover/card:scale-[1.06]">
            <GarmentImage
              silhouette={product.silhouette}
              color={color}
              view="front"
              className="absolute inset-0 h-full w-full transition-opacity duration-300 pointer-fine:group-hover/card:opacity-0"
            />
            <GarmentImage
              silhouette={product.silhouette}
              color={color}
              view="back"
              className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300 pointer-fine:group-hover/card:opacity-100"
            />
          </div>
        </Link>

        {/* Technical overlay */}
        <CornerFrame tone="cyan" size={14} className="m-2 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100" />
        <div className="pointer-events-none absolute inset-x-4 top-[46%] flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
          <span className="h-px flex-1 origin-left scale-x-0 bg-cyan/40 transition-transform duration-300 group-hover/card:scale-x-100" />
          <span className="label text-[8.5px]! text-cyan/80">{pad((index ?? 0) + 1, 3)}.{product.weight.replace(/\D/g, "")}</span>
        </div>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-2">
          {product.isNew && <StreetTag tone="acid" rotate={-5}>New</StreetTag>}
          {discount > 0 && <StreetTag rotate={3}>−{discount}%</StreetTag>}
        </div>

        <button
          onClick={() => toggleWishlist(product)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={hydrated && wished}
          className="absolute top-2 right-2 grid h-10 w-10 place-items-center text-bone transition-colors hover:text-volt"
        >
          <motion.span key={String(hydrated && wished)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            <Heart size={18} className={cn(hydrated && wished && "fill-volt text-volt drop-shadow-[0_0_6px_rgb(255_46_147/0.9)]")} />
          </motion.span>
        </button>

        {/* Quick actions */}
        <div className="absolute inset-x-2 bottom-2 flex translate-y-0 gap-1 transition-all duration-200 pointer-fine:translate-y-3 pointer-fine:opacity-0 pointer-fine:group-hover/card:translate-y-0 pointer-fine:group-hover/card:opacity-100 pointer-fine:group-focus-within/card:translate-y-0 pointer-fine:group-focus-within/card:opacity-100">
          <AnimatePresence mode="wait" initial={false}>
            {quickAdd ? (
              <motion.div
                key="sizes"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                className="clip-angle-sm flex flex-1 items-stretch bg-ink/90 backdrop-blur"
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
              <motion.div key="actions" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }} className="flex flex-1 gap-1">
                <button
                  onClick={() => setQuickAdd(true)}
                  className="clip-angle-sm label flex flex-1 items-center justify-center gap-1.5 bg-bone py-3 font-bold text-ink transition-colors hover:bg-volt"
                >
                  <Plus size={13} strokeWidth={3} /> Quick add
                </button>
                <Link
                  href={`/customize/${product.slug}?color=${color}`}
                  className="clip-angle-sm label flex flex-1 items-center justify-center gap-1.5 bg-ink/85 py-3 font-bold text-cyan backdrop-blur transition-colors hover:bg-cyan hover:text-ink"
                >
                  <Wand2 size={13} /> Customize
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Editorial metadata */}
      <div className="pt-4">
        <div className="label flex items-center gap-2 text-fog">
          {n && <span className="text-volt">{n}</span>}
          <span className="h-px w-4 bg-line-strong" />
          {CATEGORY_META[product.category].label}
        </div>
        <Link href={href} className="display mt-2 block text-[clamp(1.6rem,2.6vw,2.2rem)] transition-colors hover:text-volt">
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-3">
          <p className="font-wide text-lg font-extrabold italic">{formatINR(product.basePrice)}</p>
          {product.compareAtPrice && <p className="font-mono text-xs text-fog line-through">{formatINR(product.compareAtPrice)}</p>}
        </div>
        <div className="mt-3 flex items-center gap-2" role="radiogroup" aria-label="Color">
          {product.colors.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={c === color}
              aria-label={COLORS[c].name}
              onClick={() => setColor(c)}
              className={cn("p-[3px] transition-all duration-150 hover:scale-110", c === color ? "ring-1 ring-volt shadow-[0_0_8px_rgb(255_46_147/0.6)]" : "ring-1 ring-transparent hover:ring-line-strong")}
            >
              <span className="block h-3.5 w-5 -skew-x-12" style={{ background: COLORS[c].swatch }} />
            </button>
          ))}
          <span className="label ml-1 text-fog">{product.colors.map((c) => COLORS[c].name).join(" / ")}</span>
        </div>
        <Link
          href={`/customize/${product.slug}?color=${color}`}
          className="label mt-3 hidden items-center gap-2 text-cyan opacity-0 transition-[opacity,transform] duration-200 pointer-fine:inline-flex -translate-x-3 group-hover/card:translate-x-0 group-hover/card:opacity-100 focus-visible:opacity-100"
          tabIndex={-1}
        >
          Customize <ArrowRight size={12} />
        </Link>
      </div>
    </article>
  );
}
