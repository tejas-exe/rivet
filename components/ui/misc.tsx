import { Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { COLORS } from "@/data/colors";
import type { ColorId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Barcode, CrossMark, NeonGlow, Scribble } from "./street";

export function Stars({ rating, size = 12, className }: { rating: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-fog" strokeWidth={1.5} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="fill-volt text-volt" strokeWidth={1.5} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Swatch({ color, size = 12, className }: { color: ColorId; size?: number; className?: string }) {
  return (
    <span
      title={COLORS[color].name}
      className={cn("inline-block shrink-0 ring-1 ring-white/20", className)}
      style={{ width: size, height: size, background: COLORS[color].swatch }}
    />
  );
}

/**
 * Editorial section header: tiny HUD index line, huge condensed italic
 * title, optional aside. `title` accepts ReactNode — wrap words in
 * <em> to get the outlined treatment.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  aside,
  className,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <p className="label mb-5 flex items-center gap-3 text-fog">
          {index && (
            <span className="font-wide text-[13px] font-black tracking-normal text-volt">{index}</span>
          )}
          <span className="h-px w-10 bg-volt/70" />
          <span className="text-bone-dim">{eyebrow}</span>
          <span className="hidden text-fog/70 sm:inline">///</span>
        </p>
        <h2 className="display text-[clamp(2.8rem,8vw,6.5rem)] [&_em]:text-outline-bone [&_em]:not-italic">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="RIVET home">
      <span className="relative grid h-6 w-6 place-items-center">
        <span className="absolute inset-0.5 rotate-45 border-2 border-bone transition-transform duration-300 group-hover:rotate-[135deg]" />
        <span className="h-1.5 w-1.5 bg-volt shadow-[0_0_10px_rgb(255_46_147/0.9)]" />
      </span>
      <span className="font-cond text-[24px] leading-none font-black tracking-[0.01em] italic">RIVET</span>
      <span className="label hidden border-l border-line-strong pl-2 text-[8.5px]! leading-tight text-fog xl:block">
        Custom
        <br />
        Garage
      </span>
    </Link>
  );
}

/** Inner-page hero: neon bloom, grid, giant italic title, HUD meta. */
export function PageHero({ eyebrow, title, children, meta }: { eyebrow: string; title: ReactNode; children?: ReactNode; meta?: string }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line pt-32 pb-12 md:pt-40 md:pb-16">
      <div className="bg-blueprint pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <NeonGlow tone="pink" className="-top-40 -left-40 -z-10 h-[520px] w-[720px]" />
      <NeonGlow tone="cyan" className="-top-20 right-[-10%] -z-10 h-[360px] w-[520px] opacity-70" />
      <div className="speed-lines pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 opacity-60 [mask-image:linear-gradient(to_top,black,transparent)]" />
      <div className="relative mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="label flex items-center gap-3 text-mute">
            <span className="h-1.5 w-1.5 bg-volt shadow-[0_0_8px_rgb(255_46_147/0.9)]" />
            {eyebrow}
          </p>
          <div className="hidden items-center gap-4 md:flex">
            <span className="label text-fog">{meta ?? "RVT / 2026"}</span>
            <Barcode />
          </div>
        </div>
        <h1 className="display text-[clamp(3.4rem,11vw,9.5rem)] [&_em]:text-outline-bone [&_em]:not-italic">{title}</h1>
        <Scribble className="mt-3 h-3 w-40 md:w-56" />
        {children}
      </div>
    </section>
  );
}

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1600px] px-4 md:px-8", className)}>{children}</div>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="relative flex flex-col items-center overflow-hidden border-y border-line px-6 py-20 text-center">
      <NeonGlow tone="violet" className="top-1/2 left-1/2 h-[380px] w-[620px] -translate-x-1/2 -translate-y-1/2" />
      <div className="relative mb-6 flex items-center gap-3">
        <CrossMark className="h-6 w-6" />
        <span className="label text-fog">Empty bay / 00</span>
        <CrossMark tone="cyan" className="h-6 w-6" />
      </div>
      <h2 className="display relative mb-3 text-5xl md:text-6xl">{title}</h2>
      <p className="relative mb-8 max-w-md text-mute">{body}</p>
      <div className="relative">{action}</div>
    </div>
  );
}
