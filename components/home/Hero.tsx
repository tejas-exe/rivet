"use client";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, MousePointer2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GarmentPreview } from "@/components/garment/GarmentPreview";
import { ButtonLink } from "@/components/ui/Button";
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
  const [colorIdx, setColorIdx] = useState(0);
  const color: ColorId = COLOR_ORDER[colorIdx];

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotateY = useTransform(sx, [-1, 1], [-22, 22]);
  const rotateX = useTransform(sy, [-1, 1], [9, -9]);
  const lightX = useTransform(sx, [-1, 1], ["35%", "65%"]);
  const shadowX = useTransform(sx, [-1, 1], [30, -30]);

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
    raf = requestAnimationFrame(loop);
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
  }, [mx, my]);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Backdrop: grid floor, spotlight cone, vignette */}
      <div className="bg-blueprint absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_60%_45%,black,transparent_75%)]" />
      <motion.div
        className="absolute top-0 -z-10 h-[120%] w-[70vw] max-w-[1000px] -translate-x-1/2 opacity-80 md:left-[62%]"
        style={{
          left: lightX,
          background: "conic-gradient(from 180deg at 50% 0%, transparent 160deg, rgba(238,235,227,0.13) 172deg, rgba(238,235,227,0.2) 180deg, rgba(238,235,227,0.13) 188deg, transparent 200deg)",
          filter: "blur(18px)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ink via-ink/60 to-transparent" />

      <div className="mx-auto grid min-h-[100svh] max-w-[1600px] grid-cols-1 items-center px-4 pt-28 pb-16 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div className="relative z-10 order-2 lg:order-1">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease }} className="label mb-6 flex items-center gap-3 text-mute">
            <span className="h-1.5 w-1.5 bg-volt" /> Custom apparel garage — Season 03
          </motion.p>
          <h1 className="display text-[clamp(3.4rem,10.5vw,10rem)]">
            {["Wear", "Your", "Design."].map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.04em]">
                <motion.span
                  className={i === 2 ? "block text-volt" : "block"}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.15 + i * 0.09, duration: 0.9, ease }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-7 max-w-md font-wide text-lg font-semibold uppercase leading-snug text-bone-dim md:text-xl">
            Build it. Customize it. Make it yours.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.6, ease }} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/customize" size="xl" icon={<ArrowRight size={16} />}>
              Start customizing
            </ButtonLink>
            <ButtonLink href="/shop" size="xl" variant="ghost">
              Shop collection
            </ButtonLink>
          </motion.div>
          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-14 grid max-w-md grid-cols-3 border-t border-line pt-5">
            {[
              ["From", formatINR(400)],
              ["Print", "₹50/10in²"],
              ["Ships", "5–7 days"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="label text-fog">{k}</dt>
                <dd className="mt-1 font-wide text-sm font-bold">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Garment stage */}
        <div className="relative order-1 mx-auto mb-10 w-full max-w-[640px] lg:order-2 lg:mb-0" style={{ perspective: 1400 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.2, duration: 1.2, ease }} className="relative">
            <motion.div style={{ rotateY, rotateX }} className="preserve-3d relative">
              <GarmentPreview silhouette="oversized-tee" color={color} designs={HERO_DESIGNS[color]} className="w-full" />
            </motion.div>
            {/* floor shadow */}
            <motion.div style={{ x: shadowX }} className="mx-auto -mt-[6%] h-10 w-[62%] rounded-[50%] bg-black/70 blur-2xl" />
          </motion.div>

          {/* HUD callouts */}
          <div className="pointer-events-none absolute inset-0 hidden sm:block">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="absolute top-[30%] left-0 flex items-center gap-2">
              <div className="border border-line-strong bg-ink/70 px-3 py-2 backdrop-blur">
                <p className="label text-fog">Front print</p>
                <p className="font-mono text-xs text-bone">{formatDims(HERO_DESIGNS[color].front[0].width, HERO_DESIGNS[color].front[0].height)}</p>
              </div>
              <span className="h-px w-12 bg-line-strong" />
              <span className="h-1.5 w-1.5 rotate-45 bg-volt" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.35 }} className="absolute top-[14%] right-0 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rotate-45 bg-volt" />
              <span className="h-px w-10 bg-line-strong" />
              <div className="border border-line-strong bg-ink/70 px-3 py-2 backdrop-blur">
                <p className="label text-fog">Color</p>
                <AnimatePresence mode="wait">
                  <motion.p key={color} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="font-mono text-xs text-bone uppercase">
                    {COLORS[color].name}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute right-[4%] bottom-[12%] border border-line-strong bg-ink/70 px-3 py-2 backdrop-blur">
              <p className="label text-fog">Build total</p>
              <p className="font-wide text-lg font-black text-volt">{formatINR(priceBuild(400, HERO_DESIGNS[color]).total)}</p>
            </motion.div>
          </div>

          <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-2" role="radiogroup" aria-label="Preview color">
            {COLOR_ORDER.map((c, i) => (
              <button
                key={c}
                role="radio"
                aria-checked={i === colorIdx}
                aria-label={COLORS[c].name}
                onClick={() => setColorIdx(i)}
                className={`h-3 w-3 rounded-full ring-1 ring-offset-2 ring-offset-ink transition-all ${i === colorIdx ? "scale-125 ring-volt" : "ring-white/25"}`}
                style={{ background: COLORS[c].swatch }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="label absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-fog lg:flex">
        <MousePointer2 size={12} /> Move to inspect
      </div>
    </section>
  );
}
