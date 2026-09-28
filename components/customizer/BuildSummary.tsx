"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { GarmentPreview } from "@/components/garment/GarmentPreview";
import { COLORS } from "@/data/colors";
import { formatDims, formatINR } from "@/lib/format";
import { ZONE_LABELS, ZONE_ORDER } from "@/lib/garment";
import { sound } from "@/lib/sound";
import { useCart } from "@/store/cart";
import { buildToCartItem, useCustomizer } from "@/store/customizer";
import { useStudioUI } from "@/store/studio";
import { useUI } from "@/store/ui";
import { useBuildPrice } from "./PriceHUD";

const ease = [0.22, 1, 0.36, 1] as const;

export function BuildSummary() {
  const open = useStudioUI((s) => s.summaryOpen);
  const setSummary = useStudioUI((s) => s.setSummary);
  const state = useCustomizer();
  const { product, price } = useBuildPrice();
  const add = useCart((s) => s.add);
  const replace = useCart((s) => s.replace);
  const openCart = useUI((s) => s.openCart);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSummary(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setSummary]);

  const addToCart = () => {
    const line = buildToCartItem(state, product);
    const item = state.editingItemId && useCart.getState().items.some((i) => i.id === state.editingItemId) ? replace(state.editingItemId, line) : add(line);
    useCustomizer.setState({ editingItemId: null });
    sound.play("confirm");
    setSummary(false);
    setTimeout(() => openCart(item.id), 250);
  };

  const lines = ZONE_ORDER.map((z) => ({ zone: z, print: price.prints.find((p) => p.zone === z) }));

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] overflow-y-auto bg-ink/95 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Build summary">
          <div className="bg-blueprint pointer-events-none fixed inset-0 opacity-40" />
          <div className="garage-light pointer-events-none fixed inset-0" />
          <motion.div className="pointer-events-none fixed top-1/2 left-0 h-[2px] w-full bg-gradient-to-r from-volt via-violet to-cyan" initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ duration: 0.6, ease }} />
          <div className="relative mx-auto grid min-h-full max-w-[1400px] items-center gap-8 px-4 py-10 md:px-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="relative grid grid-cols-2 gap-2">
              <div className="floor-reflection pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rotate-180" />
              {(["front", "back"] as const).map((face, i) => (
                <motion.div key={face} initial={{ opacity: 0, y: 40, rotateY: i ? -25 : 25 }} animate={{ opacity: 1, y: 0, rotateY: 0 }} transition={{ delay: 0.15 + i * 0.12, duration: 0.9, ease }} style={{ perspective: 1000 }}>
                  <GarmentPreview silhouette={product.silhouette} color={state.color} face={face} designs={state.designs} />
                  <p className="label mt-2 text-center text-fog">
                    <span className="text-cyan">Cam 0{i + 1}</span> / {face}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.8, ease }}>
              <p className="label flex items-center gap-2 text-volt">
                <span className="h-1.5 w-1.5 bg-volt" /> Build complete <span className="text-fog">/ {product.id.replace("p-", "")}</span>
              </p>
              <h2 className="display mt-3 text-[clamp(3rem,6vw,5.5rem)]">{product.name}</h2>
              <div className="mt-4 flex gap-6">
                <p className="label text-fog">
                  Paint <span className="font-wide text-lg font-extrabold text-bone italic">{COLORS[state.color].name}</span>
                </p>
                <p className="label text-fog">
                  Size <span className="font-wide text-lg font-extrabold text-bone italic">{state.size}</span>
                </p>
              </div>

              <div className="mt-8 divide-y divide-line border-y border-line">
                {lines.map(({ zone, print }, i) => (
                  <motion.div key={zone} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.07 }} className="flex items-baseline justify-between gap-4 py-3">
                    <div>
                      <p className="label text-bone">
                        <span className="text-fog">0{i + 1}</span> {ZONE_LABELS[zone]}
                      </p>
                      <p className="mt-0.5 text-sm text-mute">
                        {print ? (print.count > 1 ? `${print.count} custom graphics` : state.designs[zone][0]?.name || "Custom graphic") : "No print"}
                      </p>
                    </div>
                    <div className="text-right font-mono text-sm">
                      {print ? (
                        <>
                          <p>{print.count > 1 ? `${print.area.toFixed(1)} in²` : formatDims(print.width, print.height)}</p>
                          <p className="text-xs text-cyan">+{formatINR(print.price)}</p>
                        </>
                      ) : (
                        <p className="text-fog">—</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <dl className="mt-6 space-y-2 font-mono text-sm">
                <div className="flex justify-between"><dt className="label text-fog">Base</dt><dd>{formatINR(price.base)}</dd></div>
                <div className="flex justify-between"><dt className="label text-fog">Printing</dt><dd>{formatINR(price.printing)}</dd></div>
              </dl>
              <div className="mt-4 flex items-end justify-between border-t border-line-strong pt-4">
                <p className="label text-fog">Total</p>
                <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.7, type: "spring", stiffness: 200 }} className="display neon-text text-8xl text-volt">
                  {formatINR(price.total)}
                </motion.p>
              </div>

              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                <button onClick={() => { sound.play("select"); setSummary(false); }} className="clip-angle label flex h-14 items-center justify-center gap-2 bg-steel/80 font-bold transition-colors hover:bg-bone hover:text-ink">
                  <ArrowLeft size={15} /> Back to edit
                </button>
                <button onClick={addToCart} className="clip-angle flex h-14 items-center justify-center gap-2 bg-volt font-wide text-sm font-extrabold tracking-[0.14em] text-ink uppercase italic transition-[background-color,filter] hover:bg-bone hover:drop-shadow-[0_0_14px_rgb(255_46_147/0.6)]">
                  <ShoppingBag size={16} /> {state.editingItemId ? "Update build in cart" : "Add build to cart"}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
