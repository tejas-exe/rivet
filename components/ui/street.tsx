"use client";
/**
 * Street / HUD primitives for the "Night Garage" visual system.
 * Every mark here is original CSS/SVG drawn for RIVET — hand-drawn circles,
 * arrows, stickers, tick-marked dividers and oversized section numbers.
 */
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "pink" | "cyan" | "acid" | "bone" | "fog";

const TEXT: Record<Tone, string> = {
  pink: "text-volt",
  cyan: "text-cyan",
  acid: "text-acid",
  bone: "text-bone",
  fog: "text-fog",
};
const BG: Record<Tone, string> = {
  pink: "bg-volt",
  cyan: "bg-cyan",
  acid: "bg-acid",
  bone: "bg-bone",
  fog: "bg-fog",
};

// ───────────────────────── HUDLabel ─────────────────────────
/** Small mono technical label: `▪ 01 / CUSTOM STUDIO`. */
export function HUDLabel({
  children,
  index,
  tone = "fog",
  dot = true,
  className,
}: {
  children: ReactNode;
  index?: string;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("label flex items-center gap-2.5", TEXT[tone], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 shrink-0", tone === "fog" ? "bg-volt" : BG[tone])} />}
      {index && (
        <>
          <span className="text-bone">{index}</span>
          <span className="opacity-50">/</span>
        </>
      )}
      <span>{children}</span>
    </p>
  );
}

// ───────────────────────── TechnicalDivider ─────────────────────────
/** Thin rule with end ticks that extends across the screen on reveal. */
export function TechnicalDivider({ label, meta, className, tone = "pink" }: { label?: string; meta?: string; className?: string; tone?: Tone }) {
  return (
    <div className={cn("relative flex items-center gap-3", className)} aria-hidden>
      {label && <span className="label shrink-0 text-fog">{label}</span>}
      <span className="relative h-px flex-1 overflow-hidden">
        <motion.span
          className="absolute inset-0 origin-left bg-line-strong"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
      <span className={cn("h-2.5 w-px", BG[tone])} />
      {meta && <span className="label shrink-0 text-fog">{meta}</span>}
    </div>
  );
}

// ───────────────────────── NeonGlow ─────────────────────────
/** Soft neon bloom. Radial gradient only — no blur filter, cheap to paint. */
export function NeonGlow({ tone = "pink", className, style }: { tone?: "pink" | "cyan" | "violet"; className?: string; style?: CSSProperties }) {
  const rgb = tone === "pink" ? "255 46 147" : tone === "cyan" ? "34 234 255" : "139 92 255";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute", className)}
      style={{ background: `radial-gradient(closest-side, rgb(${rgb} / 0.32), rgb(${rgb} / 0.1) 55%, transparent)`, ...style }}
    />
  );
}

// ───────────────────────── StreetTag ─────────────────────────
/** Sticker-style label slapped on at an angle. */
export function StreetTag({ children, tone = "pink", rotate = -4, className }: { children: ReactNode; tone?: Tone; rotate?: number; className?: string }) {
  return (
    <span
      className={cn("label inline-block px-2 py-1 text-[10px]! font-bold text-ink shadow-[3px_3px_0_rgb(0_0_0/0.5)]", BG[tone], className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

// ───────────────────────── SectionNumber ─────────────────────────
/** Oversized outlined background number that drifts on scroll. */
export function SectionNumber({ n, className, speed = 0.25 }: { n: string; className?: string; speed?: number }) {
  return (
    <Parallax speed={speed} className={cn("pointer-events-none absolute select-none", className)}>
      <span aria-hidden className="display text-outline block text-[clamp(8rem,22vw,20rem)] leading-none">
        {n}
      </span>
    </Parallax>
  );
}

// ───────────────────────── OutlineHeading ─────────────────────────
export interface HeadingLine {
  text: string;
  style?: "solid" | "outline" | "pink" | "cyan";
  indent?: string;
}

/** Big condensed heading; each line slides up out of a mask. */
export function OutlineHeading({ lines, as: Tag = "h2", className, delay = 0, inView = true }: { lines: HeadingLine[]; as?: "h1" | "h2" | "p"; className?: string; delay?: number; inView?: boolean }) {
  const style = (s: HeadingLine["style"]) =>
    s === "outline" ? "text-outline-bone" : s === "pink" ? "text-volt" : s === "cyan" ? "text-cyan" : "";
  return (
    <Tag className={cn("display", className)}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pr-[0.08em] pb-[0.04em]" style={{ paddingLeft: l.indent }}>
          <motion.span
            className={cn("block", style(l.style))}
            initial={{ y: "105%" }}
            {...(inView ? { whileInView: { y: 0 }, viewport: { once: true, margin: "-60px" } } : { animate: { y: 0 } })}
            transition={{ delay: delay + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {l.text}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// ───────────────────────── Hand-drawn marks ─────────────────────────
const stroke = (tone: Tone) => (tone === "pink" ? "#ff2e93" : tone === "cyan" ? "#22eaff" : tone === "acid" ? "#d9ff3d" : tone === "bone" ? "#f3f1ff" : "#5c5b7c");

/** Rough marker circle, drawn in. Stretches to fill its box. */
export function RoughCircle({ tone = "pink", className, width = 2.5, delay = 0 }: { tone?: Tone; className?: string; width?: number; delay?: number }) {
  return (
    <svg viewBox="0 0 200 100" preserveAspectRatio="none" className={cn("pointer-events-none absolute overflow-visible", className)} aria-hidden>
      <path
        d="M34 16 C 78 1, 162 4, 189 30 C 206 53, 175 88, 108 94 C 45 99, 5 79, 10 51 C 14 28, 55 11, 126 9"
        fill="none"
        stroke={stroke(tone)}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={1}
        className="draw-in"
        style={{ ["--len" as string]: 1, ["--delay" as string]: `${delay}s` } as CSSProperties}
      />
    </svg>
  );
}

/** Scribbled underline. */
export function Scribble({ tone = "pink", className, delay = 0 }: { tone?: Tone; className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" className={cn("pointer-events-none overflow-visible", className)} aria-hidden>
      <path
        d="M2 9 C 40 3, 78 12, 118 6 S 176 11, 198 4 M 30 12 C 80 8, 130 10, 170 8"
        fill="none"
        stroke={stroke(tone)}
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={1}
        className="draw-in"
        style={{ ["--len" as string]: 1, ["--delay" as string]: `${delay}s` } as CSSProperties}
      />
    </svg>
  );
}

/** Hand-drawn arrow pointing right (rotate with className). */
export function ArrowMark({ tone = "bone", className, delay = 0 }: { tone?: Tone; className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 100 36" className={cn("pointer-events-none overflow-visible", className)} aria-hidden>
      <path
        d="M4 28 C 30 30, 62 24, 94 12 M 78 5 L 95 12 L 83 26"
        fill="none"
        stroke={stroke(tone)}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="draw-in"
        style={{ ["--len" as string]: 1, ["--delay" as string]: `${delay}s` } as CSSProperties}
      />
    </svg>
  );
}

/** Rough ✕ mark. */
export function CrossMark({ tone = "pink", className }: { tone?: Tone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("pointer-events-none", className)} aria-hidden>
      <path d="M4 5 C 9 10, 14 15, 20 20 M 19 4 C 14 9, 9 14, 5 20" fill="none" stroke={stroke(tone)} strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
}

/** Barcode strip — decorative. */
export function Barcode({ className }: { className?: string }) {
  return <span aria-hidden className={cn("barcode block h-5 w-20 text-bone/40", className)} />;
}

/** Corner brackets framing a box (HUD target). */
export function CornerFrame({ tone = "cyan", className, size = 12 }: { tone?: Tone; className?: string; size?: number }) {
  const c = stroke(tone);
  const s = { width: size, height: size, borderColor: c };
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <span className="absolute top-0 left-0 border-t-2 border-l-2" style={s} />
      <span className="absolute top-0 right-0 border-t-2 border-r-2" style={s} />
      <span className="absolute bottom-0 left-0 border-b-2 border-l-2" style={s} />
      <span className="absolute right-0 bottom-0 border-r-2 border-b-2" style={s} />
    </span>
  );
}

/** Dimension line: |←── 8.4 IN ──→| */
export function Measure({ value, className, vertical = false, tone = "cyan", style }: { value: string; className?: string; vertical?: boolean; tone?: Tone; style?: CSSProperties }) {
  const color = TEXT[tone];
  if (vertical)
    return (
      <span aria-hidden className={cn("pointer-events-none absolute flex flex-col items-center", color, className)} style={style}>
        <span className="h-px w-2.5 bg-current" />
        <span className="w-px flex-1 bg-current opacity-60" />
        <span className="label vertical-text rotate-180 py-1 text-[9px]! whitespace-nowrap">{value}</span>
        <span className="w-px flex-1 bg-current opacity-60" />
        <span className="h-px w-2.5 bg-current" />
      </span>
    );
  return (
    <span aria-hidden className={cn("pointer-events-none absolute flex items-center", color, className)} style={style}>
      <span className="h-2.5 w-px bg-current" />
      <span className="h-px flex-1 bg-current opacity-60" />
      <span className="label px-1.5 text-[9px]! whitespace-nowrap">{value}</span>
      <span className="h-px flex-1 bg-current opacity-60" />
      <span className="h-2.5 w-px bg-current" />
    </span>
  );
}

// ───────────────────────── Motion helpers ─────────────────────────
/** Vertical parallax drift tied to the element's scroll position. */
export function Parallax({ children, speed = 0.2, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

/** Horizontal drift tied to scroll (for giant background words). */
export function ScrollDrift({ children, distance = 160, className }: { children: ReactNode; distance?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { x }}>
      {children}
    </motion.div>
  );
}

/** Mask reveal — content wipes in from the left when scrolled into view. */
export function MaskReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
