"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Flag } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
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

function Row({ k, v, sub, accent }: { k: string; v: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="label text-fog">{k}</span>
      <span className={cn("text-right font-mono text-sm tabular-nums", accent && "text-volt")}>
        {v}
        {sub && <span className="block text-[10px] text-fog">{sub}</span>}
      </span>
    </div>
  );
}

/** Right-hand "YOUR BUILD" panel. */
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
          Your build {editing && <span className="bg-bone px-1.5 text-ink">Editing</span>}
        </p>
        <AnimatePresence mode="wait">
          <motion.p key={product.slug} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="mt-2 font-wide text-2xl leading-none font-black uppercase">
            {product.buildName}
          </motion.p>
        </AnimatePresence>
        <p className="label mt-2 text-mute">
          {COLORS[color].name} / {size}
        </p>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto border-t border-line px-5 pt-3">
        <Row k="Base" v={formatINR(price.base)} />
        <AnimatePresence initial={false}>
          {price.prints.map((p) => (
            <motion.div key={p.zone} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-dashed border-line">
              <Row k={`${ZONE_LABELS[p.zone]} print`} v={p.count > 1 ? `${p.count} graphics` : formatDims(p.width, p.height)} />
              <Row k="Print area" v={`${p.area.toFixed(2)} IN²`} />
              <Row k="Printing" v={<AnimatedNumber value={p.price} />} sub={`${p.units} × ${formatINR(PRINT_RATE_INR)}`} accent />
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

      <div className="border-t border-line px-5 pt-4 pb-5">
        <p className="label text-fog">Total</p>
        <AnimatedNumber value={price.total} className="block font-wide text-5xl leading-none font-black tracking-tight" />
        <p className="mt-1 font-mono text-[10px] text-fog">Incl. taxes · ships in 5–7 days</p>
        <button
          onClick={() => {
            sound.play("confirm");
            setSummary(true);
          }}
          onMouseEnter={() => sound.play("hover")}
          className="clip-notch group relative mt-4 flex h-14 w-full items-center justify-center gap-3 overflow-hidden bg-volt font-wide text-sm font-black tracking-[0.18em] text-ink uppercase"
        >
          <span className="absolute inset-0 -translate-x-full bg-bone transition-transform duration-500 group-hover:translate-x-0" />
          <Flag size={16} className="relative" /> <span className="relative">Finish build</span>
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
    <div className="flex items-center gap-3 border-t border-line bg-ink px-4 py-2.5" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
      <div className="min-w-0 flex-1">
        <p className="label text-[9px]! text-fog">
          Total {price.printing > 0 && <>· {formatINR(price.base)} + {formatINR(price.printing)} print</>}
        </p>
        <AnimatedNumber value={price.total} className="font-wide text-2xl leading-tight font-black" />
      </div>
      <button
        onClick={() => {
          sound.play("confirm");
          setSummary(true);
        }}
        className="clip-notch-sm flex h-12 items-center gap-2 bg-volt px-5 font-wide text-xs font-black tracking-[0.14em] text-ink uppercase"
      >
        <Flag size={14} /> Finish build
      </button>
    </div>
  );
}
