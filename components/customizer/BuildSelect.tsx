"use client";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, CornerDownLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { COLORS, COLOR_ORDER } from "@/data/colors";
import { DEFAULT_BUILD, getProductsByCategory } from "@/data/products";
import { formatINR } from "@/lib/format";
import { SILHOUETTES } from "@/lib/garment";
import { sound } from "@/lib/sound";
import type { Category, ColorId, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { studioSignals, TurntableGarment } from "./TurntableGarment";

const StudioEnvironment = dynamic(() => import("./StudioEnvironment"), { ssr: false });

const CLASSES: { id: Category; label: string }[] = [
  { id: "tshirt", label: "T-Shirt" },
  { id: "hoodie", label: "Hoodie" },
];

function ordered(category: Category) {
  const list = getProductsByCategory(category);
  const def = list.find((p) => p.slug === DEFAULT_BUILD[category])!;
  return [def, ...list.filter((p) => p !== def)];
}

function stats(p: Product) {
  const gsm = parseInt(p.weight, 10);
  const z = SILHOUETTES[p.silhouette].zones;
  const canvas = Object.values(z).reduce((s, x) => s + x.widthIn * x.heightIn, 0);
  return [
    { label: "Weight", value: (gsm - 150) / 320, readout: `${gsm} GSM` },
    { label: "Print canvas", value: canvas / 450, readout: `${Math.round(canvas)} in²` },
    { label: "Comfort", value: Math.min(1, p.rating / 5), readout: `${p.rating.toFixed(1)} / 5` },
    { label: "Base price", value: p.basePrice / 1300, readout: formatINR(p.basePrice) },
  ];
}

export function BuildSelect() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("tshirt");
  const [index, setIndex] = useState(0);
  const [color, setColor] = useState<ColorId>("black");
  const [launching, setLaunching] = useState(false);
  const rotY = useMotionValue(0);

  const list = ordered(category);
  const product = list[index % list.length];
  const activeColor = product.colors.includes(color) ? color : product.colors[0];

  // Showroom sway — the garment idles back and forth under the spotlight.
  const flip = useMotionValue(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      rotY.set(flip.get() + Math.sin((t - t0) / 1600) * 28);
      studioSignals.rotY = rotY.get();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rotY, flip]);

  const switchClass = useCallback(
    (c: Category) => {
      if (c === category) return;
      sound.play("whoosh");
      setCategory(c);
      setIndex(0);
    },
    [category],
  );

  const cycle = useCallback(
    (dir: 1 | -1) => {
      if (list.length === 1) {
        animate(flip, flip.get() + dir * 360, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
        switchClass(category === "tshirt" ? "hoodie" : "tshirt");
        return;
      }
      sound.play("select");
      setIndex((i) => (i + dir + list.length) % list.length);
      animate(flip, flip.get() + dir * 360, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    },
    [list.length, flip, switchClass, category],
  );

  const launch = useCallback(() => {
    if (launching) return;
    sound.play("confirm");
    setLaunching(true);
    setTimeout(() => router.push(`/customize/${product.slug}?color=${activeColor}`), 900);
  }, [launching, router, product.slug, activeColor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") cycle(1);
      else if (e.key === "ArrowLeft") cycle(-1);
      else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Tab") {
        e.preventDefault();
        switchClass(category === "tshirt" ? "hoodie" : "tshirt");
      } else if (e.key === "Enter") launch();
      else if (["1", "2"].includes(e.key)) {
        const c = COLOR_ORDER[+e.key - 1];
        if (product.colors.includes(c)) {
          sound.play("select");
          setColor(c);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycle, switchClass, launch, category, product.colors]);

  return (
    <div className="relative h-[100svh] overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#1d1d1d,#0a0a0a_70%)]" />
      <StudioEnvironment />
      <div className="pointer-events-none absolute top-0 left-1/2 h-full w-[60vw] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_165deg,rgba(255,250,235,0.08)_175deg,rgba(255,250,235,0.12)_180deg,rgba(255,250,235,0.08)_185deg,transparent_195deg)] blur-md" />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="label flex items-center gap-2 text-mute hover:text-bone">
          <ArrowLeft size={14} /> Exit to store
        </Link>
        <p className="label hidden text-fog md:block">RIVET Studio · Build select</p>
      </div>

      {/* Title */}
      <div className="absolute inset-x-0 top-14 z-10 px-4 text-center md:top-16">
        <motion.p initial={{ opacity: 0, letterSpacing: "0.6em" }} animate={{ opacity: 1, letterSpacing: "0.18em" }} transition={{ duration: 1.2 }} className="label text-volt">
          Step 01 / Select base
        </motion.p>
        <h1 className="display mt-2 overflow-hidden text-[clamp(2rem,6vw,4.6rem)]">
          <motion.span className="block" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            Choose your build
          </motion.span>
        </h1>
        <div className="mt-5 inline-flex border border-line-strong bg-ink/60 backdrop-blur" role="tablist">
          {CLASSES.map((c) => {
            const base = getProductsByCategory(c.id).find((p) => p.slug === DEFAULT_BUILD[c.id])!.basePrice;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={category === c.id}
                onClick={() => switchClass(c.id)}
                onMouseEnter={() => sound.play("hover")}
                className={cn("relative px-5 py-2.5 text-left transition-colors md:px-8", category === c.id ? "text-ink" : "text-bone-dim hover:text-bone")}
              >
                {category === c.id && <motion.span layoutId="class-pill" className="absolute inset-0 bg-volt" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="relative block font-wide text-sm font-black uppercase md:text-base">{c.label}</span>
                <span className="label relative block text-[9.5px]! opacity-70">{formatINR(base)} base</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Garment */}
      <div className="absolute inset-x-0 top-[26%] bottom-[34%] z-0 flex items-center justify-center lg:top-[24%] lg:bottom-[12%]" style={{ perspective: 1600 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={product.slug}
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={launching ? { scale: 2.6, opacity: 0, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: launching ? 0.9 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <TurntableGarment silhouette={product.silhouette} color={activeColor} rotateY={rotY} className="h-full" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Left: name + stats */}
      <div className="absolute bottom-[17%] left-4 z-10 w-[min(360px,55vw)] md:left-8 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2">
        <AnimatePresence mode="wait">
          <motion.div key={product.slug} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
            <p className="label text-fog">
              Model {String(index + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
            </p>
            <p className="display mt-2 text-[clamp(1.6rem,3.4vw,3rem)]">{product.name}</p>
            <p className="mt-2 hidden max-w-xs text-sm text-mute lg:block">{product.tagline}</p>
            <div className="mt-6 hidden space-y-3 lg:block">
              {stats(product).map((s) => (
                <div key={s.label}>
                  <div className="label mb-1.5 flex justify-between text-mute">
                    <span>{s.label}</span>
                    <span className="text-bone">{s.readout}</span>
                  </div>
                  <div className="flex gap-[3px]">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="h-2 flex-1"
                        initial={{ backgroundColor: "#232323" }}
                        animate={{ backgroundColor: i / 20 < Math.min(1, s.value) ? "#c8ff2e" : "#232323" }}
                        transition={{ delay: i * 0.015 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right: price + colors */}
      <div className="absolute right-4 bottom-[17%] z-10 text-right md:right-8 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2">
        <p className="label text-fog">Base price</p>
        <AnimatePresence mode="wait">
          <motion.p key={product.basePrice} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="font-wide text-3xl font-black text-volt sm:text-4xl lg:text-6xl">
            {formatINR(product.basePrice)}
          </motion.p>
        </AnimatePresence>
        <p className="label mt-3 mb-2 text-fog lg:mt-6 lg:mb-3">Available colors</p>
        <div className="flex flex-row justify-end gap-3 lg:flex-col lg:items-end lg:gap-2">
          {COLOR_ORDER.map((c, i) => {
            const available = product.colors.includes(c);
            const active = c === activeColor;
            return (
              <button
                key={c}
                disabled={!available}
                onClick={() => {
                  sound.play("select");
                  setColor(c);
                }}
                onMouseEnter={() => available && sound.play("hover")}
                className={cn("group flex items-center gap-3 disabled:opacity-25", active ? "text-bone" : "text-mute hover:text-bone")}
              >
                <span className="label hidden lg:inline">{COLORS[c].name}</span>
                <span className="label hidden text-fog lg:inline">[{i + 1}]</span>
                <span className={cn("h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-ink transition-all", active ? "scale-110 ring-volt" : "ring-transparent group-hover:ring-line-strong")} style={{ background: COLORS[c].swatch }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 px-4 pb-6 md:pb-8">
        <div className="flex w-full max-w-lg items-center justify-between gap-3">
          <button onClick={() => cycle(-1)} aria-label="Previous model" className="grid h-14 w-14 place-items-center border border-line-strong bg-ink/60 backdrop-blur hover:border-volt hover:text-volt">
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={launch}
            onMouseEnter={() => sound.play("hover")}
            className="clip-notch group relative h-14 flex-1 overflow-hidden bg-volt font-wide text-sm font-black tracking-[0.2em] text-ink uppercase md:text-base"
          >
            <span className="absolute inset-0 -translate-x-full bg-bone transition-transform duration-500 group-hover:translate-x-0" />
            <span className="relative flex items-center justify-center gap-3">
              Customize <CornerDownLeft size={16} />
            </span>
          </button>
          <button onClick={() => cycle(1)} aria-label="Next model" className="grid h-14 w-14 place-items-center border border-line-strong bg-ink/60 backdrop-blur hover:border-volt hover:text-volt">
            <ChevronRight size={22} />
          </button>
        </div>
        <p className="label hidden gap-5 text-fog md:flex">
          <span>← → Model</span>
          <span>↑ ↓ Class</span>
          <span>1–2 Color</span>
          <span>Enter Customize</span>
        </p>
      </div>

      {/* Launch flash */}
      <AnimatePresence>
        {launching && (
          <motion.div className="absolute inset-0 z-50 bg-ink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.45 }}>
            <motion.div className="absolute top-1/2 left-0 h-px w-full bg-volt" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
