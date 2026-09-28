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
  const btn = "relative grid h-10 w-10 place-items-center text-bone-dim transition-colors hover:text-cyan";
  return (
    <div className="relative flex h-12 items-center gap-3 border-b border-line bg-ink/95 px-3 md:h-14 md:px-5">
      <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-volt/60 via-transparent to-cyan/60" />
      <Logo className="origin-left scale-90 md:scale-100" />
      <span className="hidden h-6 w-px bg-line-strong md:block" />
      <p className="label hidden items-center gap-2 text-fog md:flex">
        <span className="text-bone">Custom studio</span> / Garage mode
        <span className="ml-1 h-1.5 w-1.5 animate-pulse bg-cyan shadow-[0_0_8px_rgb(34_234_255/0.9)]" />
      </p>
      <div className="ml-auto flex items-center gap-0.5">
        <Link href="/customize" className="group label mr-2 hidden items-center gap-1.5 border-r border-line pr-4 text-mute hover:text-bone sm:flex">
          <LayoutGrid size={13} className="transition-colors group-hover:text-volt" /> Change build
        </Link>
        <button className={cn(btn, "hidden md:grid")} onClick={() => setHelp(true)} aria-label="Controls help">
          <HelpCircle size={17} />
        </button>
        <button className={btn} onClick={toggleSound} aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}>
          {hydrated && !soundOn ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
        <button className={btn} onClick={() => openCart()} aria-label="Cart">
          <ShoppingBag size={17} />
          {hydrated && count > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center bg-volt px-0.5 font-mono text-[9px] font-bold text-ink shadow-[0_0_8px_rgb(255_46_147/0.8)]">{count}</span>}
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
          <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.22 }} className="scanlines w-full max-w-lg border-t-2 border-cyan bg-coal p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="label text-cyan">Pause menu / 00</p>
                <p className="display text-5xl">Controls</p>
              </div>
              <button onClick={() => setHelp(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt><kbd className="clip-angle-sm inline-block bg-steel px-2 py-0.5 font-mono text-[11px] text-cyan">{k}</kbd></dt>
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
          <motion.div className="flex-1 bg-ink" exit={{ y: "-100%" }} transition={{ duration: 0.45, ease: [0.7, 0, 0.3, 1] }} />
          <motion.div className="relative flex h-32 items-center justify-center overflow-hidden bg-ink" exit={{ scaleY: 0 }} transition={{ duration: 0.3 }}>
            <motion.div className="absolute inset-x-0 top-1/2 h-[2px] bg-gradient-to-r from-volt via-violet to-cyan shadow-[0_0_16px_rgb(255_46_147/0.8)]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            <div className="relative bg-ink px-6 text-center">
              <motion.p className="label text-cyan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                Entering garage / Build loaded
              </motion.p>
              <motion.p className="display text-4xl md:text-6xl" initial={{ opacity: 0, x: 60, skewX: -12 }} animate={{ opacity: 1, x: 0, skewX: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                {name}
              </motion.p>
            </div>
          </motion.div>
          <motion.div className="flex-1 bg-ink" exit={{ y: "100%" }} transition={{ duration: 0.45, ease: [0.7, 0, 0.3, 1] }} />
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
        <aside className="scanlines min-h-0 overflow-y-auto border-r border-line bg-ink/80 py-5">
          <CustomizerNavigation />
        </aside>
        <div className="flex min-h-0 flex-col">
          <GarmentViewer className="min-h-0 flex-1" />
          <div className="relative max-h-[42%] min-h-[190px] overflow-y-auto border-t border-line-strong bg-coal/95 px-6 py-5">
            <ControlDeck />
          </div>
        </div>
        <aside className="scanlines min-h-0 border-l border-line bg-ink/80 pt-5">
          <PriceHUD />
        </aside>
      </div>

      {/* Tablet / mobile */}
      <div className="relative flex min-h-0 flex-1 flex-col lg:hidden">
        <GarmentViewer className="h-[56svh] shrink-0 sm:h-[58svh]" />
        <CustomizerTabs />
        <motion.div
          className={cn("flex min-h-0 flex-col border-t-2 border-volt/70 bg-coal", sheetExpanded ? "absolute inset-x-0 bottom-0 z-20 h-[72svh] shadow-[0_-20px_60px_rgba(0,0,0,0.6)]" : "flex-1")}
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
            <span className="h-1 w-12 -skew-x-12 bg-line-strong" />
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
