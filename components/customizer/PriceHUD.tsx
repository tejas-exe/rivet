"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Flag } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Barcode } from "@/components/ui/street";
import { COLORS } from "@/data/colors";
import { getProduct } from "@/data/products";
import { formatDims, formatINR } from "@/lib/format";
import { ZONE_LABELS } from "@/lib/garment";
import { PRINT_RATE_INR, priceBuild } from "@/lib/pricing";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { useCustomizer } from "@/store/customizer";
import { useStudioUI } from "@/store/studio";

export function useBuildPrice() {
  const slug = useCustomizer((s) => s.productSlug);
  const designs = useCustomizer((s) => s.designs);
  const product = getProduct(slug)!;
  return { product, price: priceBuild(product.basePrice, designs) };
}

/** Rupee amount without the symbol, for the split "₹ / 800" readout. */
const bare = (n: number) => formatINR(n).slice(1);

function Row({ k, v, sub, accent }: { k: string; v: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className="label text-fog">{k}</span>
      <span className={cn("text-right font-mono text-sm tabular-nums", accent && "text-cyan")}>
        {v}
        {sub && <span className="block text-[10px] text-fog">{sub}</span>}
      </span>
    </div>
  );
}

/** Right-hand "YOUR BUILD" tuning sheet. */
export function PriceHUD() {
  const { product, price } = useBuildPrice();
  const color = useCustomizer((s) => s.color);
  const size = useCustomizer((s) => s.size);
  const editing = useCustomizer((s) => s.editingItemId);
  const setSummary = useStudioUI((s) => s.setSummary);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5">
        <p className="label flex items-center justify-between text-fog">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-volt shadow-[0_0_8px_rgb(255_46_147/0.9)]" /> Your build
          </span>
          {editing ? <span className="bg-cyan px-1.5 text-ink">Editing</span> : <span>/ {product.id.replace("p-", "")}</span>}
        </p>
        <AnimatePresence mode="wait">
          <motion.p key={product.slug} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }} className="display mt-3 text-4xl">
            {product.buildName}
          </motion.p>
        </AnimatePresence>
        <p className="label mt-2 text-mute">
          <span className="text-bone">{COLORS[color].name}</span> / {size}
        </p>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto border-t border-line px-5 pt-2">
        <Row k="Base" v={formatINR(price.base)} />
        <AnimatePresence initial={false}>
          {price.prints.map((p) => (
            <motion.div
              key={p.zone}
              initial={{ opacity: 0, height: 0, x: 20 }}
              animate={{ opacity: 1, height: "auto", x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-dashed border-line"
            >
              <p className="label pt-2 text-[9px]! text-cyan">{ZONE_LABELS[p.zone]} print</p>
              <Row k="Size" v={p.count > 1 ? `${p.count} graphics` : formatDims(p.width, p.height)} />
              <Row k="Print area" v={`${p.area.toFixed(2)} IN²`} />
              <Row k="Print" v={<AnimatedNumber value={p.price} />} sub={`${p.units} × ${formatINR(PRINT_RATE_INR)}`} accent />
            </motion.div>
          ))}
        </AnimatePresence>
        {price.prints.length === 0 && <p className="border-t border-dashed border-line py-3 text-xs text-fog">No prints yet. Choose a print location and upload artwork.</p>}
        {price.prints.length > 0 && (
          <div className="border-t border-line">
            <Row k="Printing total" v={<AnimatedNumber value={price.printing} />} />
          </div>
        )}
      </div>

      <div className="relative border-t border-line-strong px-5 pt-4 pb-5">
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-volt via-violet to-cyan opacity-70" />
        <div className="flex items-center justify-between">
          <p className="label text-fog">Total</p>
          <Barcode className="h-4 w-14" />
        </div>
        <div className="mt-1 flex items-start gap-1.5">
          <span className="display mt-1 text-3xl text-volt">₹</span>
          <AnimatedNumber value={price.total} format={bare} className="display block text-[5.5rem] leading-[0.85]" />
        </div>
        <p className="mt-1 font-mono text-[10px] text-fog">Incl. taxes · ships in 5–7 days</p>
        <button
          onClick={() => {
            sound.play("confirm");
            setSummary(true);
          }}
          onMouseEnter={() => sound.play("hover")}
          className="clip-angle group relative mt-4 flex h-14 w-full items-center justify-center gap-3 overflow-hidden bg-volt font-wide text-sm font-extrabold tracking-[0.18em] text-ink uppercase italic transition-[filter] hover:drop-shadow-[0_0_14px_rgb(255_46_147/0.6)]"
        >
          <span className="absolute inset-y-0 -left-[15%] w-[130%] -translate-x-[110%] -skew-x-[24deg] bg-bone transition-transform duration-300 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:translate-x-0" />
          <Flag size={16} className="relative" /> <span className="relative transition-transform duration-200 group-hover:translate-x-1">Finish build</span>
        </button>
      </div>
    </div>
  );
}

/** Mobile sticky price bar. */
export function PriceBar() {
  const { price } = useBuildPrice();
  const setSummary = useStudioUI((s) => s.setSummary);
  return (
    <div className="relative flex items-center gap-3 border-t border-line-strong bg-ink px-4 py-2.5" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-volt via-violet to-cyan opacity-70" />
      <div className="min-w-0 flex-1">
        <p className="label text-[9px]! text-fog">
          Total {price.printing > 0 && <>· {formatINR(price.base)} + {formatINR(price.printing)} print</>}
        </p>
        <AnimatedNumber value={price.total} className="display text-4xl leading-none" />
      </div>
      <button
        onClick={() => {
          sound.play("confirm");
          setSummary(true);
        }}
        className="clip-angle flex h-12 items-center gap-2 bg-volt px-5 font-wide text-xs font-extrabold tracking-[0.14em] text-ink uppercase italic shadow-[0_0_16px_rgb(255_46_147/0.4)]"
      >
        <Flag size={14} /> Finish build
      </button>
    </div>
  );
}
