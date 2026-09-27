"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, HelpCircle, LayoutGrid, ShoppingBag, Volume2, VolumeX, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useHydrated } from "@/components/layout/StoreHydrator";
import { Logo } from "@/components/ui/misc";
import { getProduct } from "@/data/products";
import type { ColorId, Size } from "@/lib/types";
import { cn } from "@/lib/utils";
import { cartCount, useCart } from "@/store/cart";
import { useCustomizer } from "@/store/customizer";
import { useStudioUI } from "@/store/studio";
import { usePrefs, useUI } from "@/store/ui";
import { BuildSummary } from "./BuildSummary";
import { ControlDeck } from "./ControlDeck";
import { CustomizerNavigation, CustomizerTabs } from "./CustomizerNavigation";
import { GarmentViewer } from "./GarmentViewer";
import { PriceBar, PriceHUD } from "./PriceHUD";
import { useStudioKeyboard } from "./useStudioKeyboard";

function TopBar() {
  const soundOn = usePrefs((s) => s.soundOn);
  const toggleSound = usePrefs((s) => s.toggleSound);
  const setHelp = useStudioUI((s) => s.setHelp);
  const openCart = useUI((s) => s.openCart);
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.items));
  const btn = "relative grid h-9 w-9 place-items-center text-bone-dim transition-colors hover:text-volt";
  return (
    <div className="flex h-12 items-center gap-3 border-b border-line bg-ink px-3 md:h-14 md:px-5">
      <Logo className="scale-90 md:scale-100" />
      <span className="label hidden text-fog md:inline">/ Studio</span>
      <div className="ml-auto flex items-center gap-0.5">
        <Link href="/customize" className="label mr-2 hidden items-center gap-1.5 text-mute hover:text-bone sm:flex">
          <LayoutGrid size={13} /> Change build
        </Link>
        <button className={cn(btn, "hidden md:grid")} onClick={() => setHelp(true)} aria-label="Controls help">
          <HelpCircle size={17} />
        </button>
        <button className={btn} onClick={toggleSound} aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}>
          {hydrated && !soundOn ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
        <button className={btn} onClick={() => openCart()} aria-label="Cart">
          <ShoppingBag size={17} />
          {hydrated && count > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center bg-volt px-0.5 font-mono text-[9px] font-bold text-ink">{count}</span>}
        </button>
        <Link href="/shop" className={btn} aria-label="Exit studio">
          <X size={18} />
        </Link>
      </div>
    </div>
  );
}

function HelpOverlay() {
  const open = useStudioUI((s) => s.helpOpen);
  const setHelp = useStudioUI((s) => s.setHelp);
  const rows = [
    ["↑ ↓", "Switch category"],
    ["← →", "Cycle option / artwork"],
    ["1 – 4", "Front · Back · L sleeve · R sleeve"],
    ["Drag", "Rotate garment / move artwork"],
    ["Scroll", "Zoom camera"],
    ["W A S D", "Nudge artwork (Shift = 1\")"],
    ["Q / E", "Rotate artwork (Shift = 15°)"],
    ["[ / ]", "Scale artwork"],
    ["C", "Center artwork"],
    ["Ctrl + D", "Duplicate artwork"],
    ["Del", "Delete artwork"],
    ["R", "Reset camera"],
    ["M", "Mute sounds"],
    ["F", "Finish build"],
  ];
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[75] grid place-items-center bg-ink/85 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHelp(false)}>
          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-lg border border-line-strong bg-coal p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <p className="display text-3xl">Controls</p>
              <button onClick={() => setHelp(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt><kbd className="border border-line-strong bg-ink px-2 py-0.5 font-mono text-[11px] text-volt">{k}</kbd></dt>
                  <dd className="text-sm text-bone-dim">{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Intro({ name }: { name: string }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1250);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="pointer-events-none fixed inset-0 z-[60] flex flex-col" exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.35 }}>
          <motion.div className="flex-1 bg-ink" exit={{ y: "-100%" }} transition={{ duration: 0.6, ease: [0.7, 0, 0.3, 1] }} />
          <motion.div className="relative flex h-24 items-center justify-center overflow-hidden bg-ink" exit={{ scaleY: 0 }} transition={{ duration: 0.4 }}>
            <motion.div className="absolute inset-x-0 top-1/2 h-px bg-volt" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
            <motion.p className="display relative bg-ink px-6 text-3xl md:text-5xl" initial={{ opacity: 0, letterSpacing: "0.4em" }} animate={{ opacity: 1, letterSpacing: "-0.02em" }} transition={{ duration: 0.8 }}>
              {name}
            </motion.p>
          </motion.div>
          <motion.div className="flex-1 bg-ink" exit={{ y: "100%" }} transition={{ duration: 0.6, ease: [0.7, 0, 0.3, 1] }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CustomizerStudio({ slug, color, size }: { slug: string; color?: ColorId; size?: Size }) {
  const hydrated = useHydrated();
  const start = useCustomizer((s) => s.start);
  const productSlug = useCustomizer((s) => s.productSlug);
  const panel = useCustomizer((s) => s.panel);
  const sheetExpanded = useStudioUI((s) => s.sheetExpanded);
  const setSheetExpanded = useStudioUI((s) => s.setSheetExpanded);
  const product = getProduct(hydrated ? productSlug : slug) ?? getProduct(slug)!;

  useStudioKeyboard();

  // Apply the route's product / colour / size once the saved draft is loaded.
  useEffect(() => {
    if (!hydrated) return;
    start(slug, { color });
    const p = getProduct(slug);
    if (size && p?.sizes.includes(size)) useCustomizer.getState().setSize(size);
  }, [hydrated, slug, color, size, start]);

  // Keep the URL in sync when the product is switched inside the studio.
  useEffect(() => {
    if (hydrated && productSlug !== slug) window.history.replaceState(null, "", `/customize/${productSlug}`);
  }, [hydrated, productSlug, slug]);

  useEffect(() => setSheetExpanded(false), [panel, setSheetExpanded]);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-ink">
      <Intro name={getProduct(slug)?.buildName ?? "Studio"} />
      <TopBar />

      {/* Desktop / laptop */}
      <div className="hidden min-h-0 flex-1 lg:grid lg:grid-cols-[250px_1fr_300px] xl:grid-cols-[270px_1fr_330px]">
        <aside className="min-h-0 overflow-y-auto border-r border-line py-5">
          <CustomizerNavigation />
        </aside>
        <div className="flex min-h-0 flex-col">
          <GarmentViewer className="min-h-0 flex-1" />
          <div className="max-h-[42%] min-h-[190px] overflow-y-auto border-t border-line bg-coal/95 px-6 py-5">
            <ControlDeck />
          </div>
        </div>
        <aside className="min-h-0 border-l border-line pt-5">
          <PriceHUD />
        </aside>
      </div>

      {/* Tablet / mobile */}
      <div className="relative flex min-h-0 flex-1 flex-col lg:hidden">
        <GarmentViewer className="h-[56svh] shrink-0 sm:h-[58svh]" />
        <CustomizerTabs />
        <motion.div
          className={cn("flex min-h-0 flex-col border-t border-line-strong bg-coal", sheetExpanded ? "absolute inset-x-0 bottom-0 z-20 h-[72svh] shadow-[0_-20px_60px_rgba(0,0,0,0.6)]" : "flex-1")}
          layout
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.15}
          dragListener={false}
        >
          <button
            onClick={() => setSheetExpanded(!sheetExpanded)}
            className="flex w-full shrink-0 flex-col items-center gap-1 pt-2 pb-1"
            aria-label={sheetExpanded ? "Collapse panel" : "Expand panel"}
          >
            <span className="h-1 w-10 bg-line-strong" />
            <ChevronUp size={12} className={cn("text-fog transition-transform", sheetExpanded && "rotate-180")} />
          </button>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <ControlDeck />
          </div>
        </motion.div>
        <PriceBar />
      </div>

      <BuildSummary />
      <HelpOverlay />
      <span className="sr-only" aria-live="polite">{product.name} studio</span>
    </div>
  );
}
