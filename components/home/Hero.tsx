"use client";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GarmentPreview, zoneBoxStyle } from "@/components/garment/GarmentPreview";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowMark, Barcode, CrossMark, NeonGlow, RoughCircle, StreetTag } from "@/components/ui/street";
import { COLORS, COLOR_ORDER } from "@/data/colors";
import { PRESET_GRAPHICS } from "@/data/graphics";
import { formatDims, formatINR } from "@/lib/format";
import { priceBuild } from "@/lib/pricing";
import type { ColorId, DesignsByZone } from "@/lib/types";

const wordmark = PRESET_GRAPHICS.find((g) => g.id === "wordmark")!;
const bolt = PRESET_GRAPHICS.find((g) => g.id === "bolt")!;

const burst = PRESET_GRAPHICS.find((g) => g.id === "burst")!;

const sleeve = [{ id: "hero-sleeve", zone: "leftSleeve" as const, name: bolt.name, src: bolt.src, x: 1.5, y: 1.5, width: 1.6, height: 2.2, rotation: 0 }];

/** Light-ink artwork on black, dark-ink artwork on white. */
const HERO_DESIGNS: Record<ColorId, DesignsByZone> = {
  black: {
    front: [{ id: "hero-front", zone: "front", name: wordmark.name, src: wordmark.src, x: 6, y: 5.2, width: 8, height: 4.8, rotation: 0 }],
    back: [],
    leftSleeve: sleeve,
    rightSleeve: [],
  },
  white: {
    front: [{ id: "hero-front", zone: "front", name: burst.name, src: burst.src, x: 6, y: 5.5, width: 6, height: 6, rotation: -8 }],
    back: [],
    leftSleeve: sleeve,
    rightSleeve: [],
  },
};
const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [colorIdx, setColorIdx] = useState(0);
  const color: ColorId = COLOR_ORDER[colorIdx];
  const front = HERO_DESIGNS[color].front[0];

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotateY = useTransform(sx, [-1, 1], [-22, 22]);
  const rotateX = useTransform(sy, [-1, 1], [9, -9]);
  const shadowX = useTransform(sx, [-1, 1], [30, -30]);
  const wordsX = useTransform(sx, [-1, 1], [24, -24]);

  // Scroll parallax: background type sinks slower than the garment rises.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const garmentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setColorIdx((i) => (i + 1) % COLOR_ORDER.length), 3600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let raf = 0;
    let idle = true;
    let idleTimer: ReturnType<typeof setTimeout>;
    const start = performance.now();
    const loop = (t: number) => {
      if (idle) mx.set(Math.sin((t - start) / 2600) * 0.45);
      raf = requestAnimationFrame(loop);
    };
    if (!reduce) raf = requestAnimationFrame(loop);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      idle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => (idle = true), 2500);
      mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onMove);
    };
  }, [mx, my, reduce]);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden">
      {/* ── Environment: overhead neon, blooms, wet floor grid ── */}
      <div className="garage-light absolute inset-0 -z-20" />
      <NeonGlow tone="pink" className="top-[10%] -left-[15%] -z-20 h-[70vh] w-[60vw]" />
      <NeonGlow tone="cyan" className="top-[20%] -right-[10%] -z-20 h-[60vh] w-[45vw] opacity-80" />
      <div className="absolute inset-x-[-20%] bottom-0 -z-20 h-[46%] overflow-hidden">
        <div className="floor-grid absolute inset-x-0 top-0 h-[200%] opacity-60" />
      </div>
      <div className="speed-lines absolute inset-x-0 top-[38%] -z-20 h-40 opacity-50 [mask-image:linear-gradient(to_right,transparent,black_30%,black_70%,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

      {/* ── Giant background type — partly hidden behind the garment ── */}
      <motion.div style={reduce ? undefined : { y: bgY, opacity: fade }} className="pointer-events-none absolute inset-x-0 top-[13%] -z-10 select-none lg:top-[9%]" aria-hidden>
        <motion.div style={reduce ? undefined : { x: wordsX }}>
          <motion.p
            initial={{ x: "-12%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease }}
            className="display pl-[3vw] text-[27vw] leading-[0.78] text-bone/[0.07] lg:text-[21vw]"
          >
            Custom
          </motion.p>
          <motion.p
            initial={{ x: "12%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            className="display text-outline-pink pr-[3vw] text-right text-[27vw] leading-[0.78] opacity-60 lg:text-[21vw]"
          >
            Culture
          </motion.p>
        </motion.div>
      </motion.div>

      {/* ── Vertical side label ── */}
      <div className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-4 xl:flex xl:flex-col" aria-hidden>
        <span className="h-16 w-px bg-line-strong" />
        <span className="label vertical-text text-fog">Street series — 2026 — Custom / 001</span>
        <span className="h-16 w-px bg-line-strong" />
      </div>

      <div className="mx-auto grid min-h-[100svh] max-w-[1600px] grid-cols-1 items-end px-4 pt-28 pb-14 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pt-24">
        {/* ── Copy block ── */}
        <div className="relative z-10 order-2 lg:order-1 lg:self-end lg:pb-10">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4, ease }} className="mb-7 flex items-start gap-5">
            <span className="mt-0.5 h-10 w-[3px] bg-volt shadow-[0_0_12px_rgb(255_46_147/0.9)]" />
            <div className="label space-y-1 text-mute">
              <p className="text-bone">Drop 001</p>
              <p>Custom streetwear</p>
              <p className="text-fog">Vadodara / India</p>
            </div>
            <Barcode className="mt-1 hidden sm:block" />
          </motion.div>

          <h1 className="display text-[clamp(3.6rem,10vw,8.5rem)]">
            {[
              { w: "Wear", cls: "" },
              { w: "Your", cls: "text-outline-bone not-italic pl-[0.6em]" },
              { w: "Design.", cls: "text-volt neon-text" },
            ].map(({ w, cls }, i) => (
              <span key={w} className="block overflow-hidden pr-[0.1em] pb-[0.04em]">
                <motion.span className={`block ${cls}`} initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ delay: 0.15 + i * 0.07, duration: 0.55, ease }}>
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.4 }} className="mt-6 max-w-md font-wide text-lg font-bold uppercase italic leading-snug text-bone-dim md:text-xl">
            Build it. Customize it. <span className="text-cyan">Make it yours.</span>
          </motion.p>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55, duration: 0.4, ease }} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/customize" size="xl" icon={<ArrowRight size={17} />}>
              Start customizing
            </ButtonLink>
            <ButtonLink href="/shop" size="xl" variant="ghost">
              Shop collection
            </ButtonLink>
          </motion.div>
          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="mt-12 grid max-w-md grid-cols-3 border-t border-line pt-4">
            {[
              ["From", formatINR(400)],
              ["Print", "₹50/10in²"],
              ["Ships", "5–7 days"],
            ].map(([k, v], i) => (
              <div key={k} className="border-l border-line pl-3 first:border-l-0 first:pl-0">
                <dt className="label text-fog">
                  <span className="text-volt">0{i + 1}</span> {k}
                </dt>
                <dd className="mt-1 font-wide text-base font-extrabold italic">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ── Garment stage ── */}
        <motion.div style={reduce ? undefined : { y: garmentY }} className="relative order-1 mx-auto mb-6 w-full max-w-[600px] lg:order-2 lg:mb-0 lg:max-w-[720px]">
          <div style={{ perspective: 1400 }}>
            <motion.div initial={{ opacity: 0, scale: 0.86, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease }} className="relative">
              {/* spotlight cone */}
              <div className="pointer-events-none absolute -top-[30%] left-1/2 h-[120%] w-[90%] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_158deg,rgb(255_240_255/0.10)_172deg,rgb(255_240_255/0.16)_180deg,rgb(255_240_255/0.10)_188deg,transparent_202deg)]" />
              <motion.div style={{ rotateY, rotateX }} className="preserve-3d relative">
                <GarmentPreview silhouette="oversized-tee" color={color} designs={HERO_DESIGNS[color]} className="w-full" />
                {/* hand-drawn circle around the front print */}
                <div className="pointer-events-none absolute hidden sm:block" style={zoneBoxStyle("oversized-tee", "front")}>
                  <RoughCircle key={color} className="top-[-8%] left-[-14%] h-[116%] w-[128%]" delay={0.9} />
                </div>
              </motion.div>
              {/* neon floor reflection + contact shadow */}
              <div className="floor-reflection pointer-events-none mx-auto -mt-[4%] h-24 w-[80%]" />
              <motion.div style={{ x: shadowX }} className="mx-auto -mt-24 h-10 w-[58%] rounded-[50%] bg-black/70 blur-2xl" />
            </motion.div>
          </div>

          {/* Street annotation */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="pointer-events-none absolute top-[6%] left-[-2%] hidden sm:block">
            <StreetTag rotate={-6}>Custom build</StreetTag>
            <div className="mt-2 ml-4 flex items-center gap-1">
              <p className="font-wide text-sm font-extrabold italic uppercase">→ Front print</p>
            </div>
            <p className="label mt-1 ml-4 text-fog">01 / 04</p>
            <ArrowMark tone="bone" className="mt-1 ml-16 h-8 w-24 rotate-[28deg]" delay={1.2} />
          </motion.div>

          {/* HUD callouts */}
          <div className="pointer-events-none absolute inset-0 hidden sm:block">
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} className="absolute top-[12%] right-0 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rotate-45 bg-cyan" />
              <span className="h-px w-10 bg-cyan/50" />
              <div className="clip-angle-sm border-l-2 border-cyan bg-ink/70 px-3 py-2 backdrop-blur">
                <p className="label text-fog">Paint</p>
                <AnimatePresence mode="wait">
                  <motion.p key={color} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="font-mono text-xs text-bone uppercase">
                    {String(colorIdx + 1).padStart(2, "0")} — {COLORS[color].name}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.15 }} className="absolute top-[52%] left-0 flex items-center gap-2">
              <div className="clip-angle-sm border-l-2 border-volt bg-ink/70 px-3 py-2 backdrop-blur">
                <p className="label text-fog">Front print</p>
                <p className="font-mono text-xs text-bone">{formatDims(front.width, front.height)}</p>
              </div>
              <span className="h-px w-10 bg-volt/50" />
              <CrossMark className="h-3.5 w-3.5" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="clip-angle absolute right-[2%] bottom-[16%] bg-ink/80 px-4 py-3 backdrop-blur">
              <p className="label text-fog">Build total</p>
              <p className="display text-4xl text-volt neon-text">{formatINR(priceBuild(400, HERO_DESIGNS[color]).total)}</p>
            </motion.div>
          </div>

          {/* Paint chips */}
          <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-3" role="radiogroup" aria-label="Preview color">
            <span className="label text-fog">Paint</span>
            {COLOR_ORDER.map((c, i) => (
              <button
                key={c}
                role="radio"
                aria-checked={i === colorIdx}
                aria-label={COLORS[c].name}
                onClick={() => setColorIdx(i)}
                className={`h-4 w-7 -skew-x-12 transition-all duration-200 hover:scale-110 ${i === colorIdx ? "scale-110" : "opacity-70"}`}
                style={{ background: COLORS[c].swatch, boxShadow: i === colorIdx ? "0 0 0 1px #ff2e93, 0 0 12px rgb(255 46 147 / 0.7)" : "inset 0 0 0 1px rgb(255 255 255 / 0.2)" }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="label absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-fog lg:flex">
        <span className="h-px w-8 bg-line-strong" />
        <ArrowDown size={12} className="text-volt" /> Scroll / Move to inspect
        <span className="h-px w-8 bg-line-strong" />
      </div>
    </section>
  );
}
