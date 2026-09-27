import { Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { COLORS } from "@/data/colors";
import type { ColorId } from "@/lib/types";
import { cn } from "@/lib/utils";

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
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        <p className="label mb-4 flex items-center gap-3 text-mute">
          {index && <span className="text-volt">{index}</span>}
          <span className="h-px w-8 bg-line-strong" />
          {eyebrow}
        </p>
        <h2 className="display text-[clamp(2.4rem,6vw,5rem)]">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="RIVET home">
      <span className="relative grid h-5 w-5 place-items-center">
        <span className="absolute inset-0 rotate-45 border-2 border-bone transition-transform duration-500 group-hover:rotate-[135deg]" />
        <span className="h-1.5 w-1.5 bg-volt" />
      </span>
      <span className="font-wide text-[19px] font-black tracking-[-0.03em]">RIVET</span>
    </Link>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-32 pb-12 md:pt-40 md:pb-16">
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-[1600px] px-4 md:px-8">
        <p className="label mb-5 flex items-center gap-3 text-mute">
          <span className="h-1.5 w-1.5 bg-volt" />
          {eyebrow}
        </p>
        <h1 className="display text-[clamp(2.8rem,8vw,7.5rem)]">{title}</h1>
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
    <div className="flex flex-col items-center border border-dashed border-line-strong px-6 py-20 text-center">
      <span className="mb-6 grid h-12 w-12 rotate-45 place-items-center border-2 border-line-strong">
        <span className="h-2 w-2 -rotate-45 bg-volt" />
      </span>
      <h2 className="display mb-3 text-3xl md:text-4xl">{title}</h2>
      <p className="mb-8 max-w-md text-mute">{body}</p>
      {action}
    </div>
  );
}
