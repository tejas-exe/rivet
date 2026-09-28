"use client";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

type Variant = "volt" | "bone" | "ghost" | "dark" | "cyan";
type Size = "sm" | "md" | "lg" | "xl";

/**
 * AngularButton — chamfered racing-plate shape. The plate is drawn by two
 * clipped layers (edge + fill) so outlined variants keep a crisp border on
 * the diagonal cuts. A skewed panel sweeps across on hover, the label nudges
 * right, the arrow "accelerates" out and back in, and a neon glow appears
 * (drop-shadow on the button follows the clipped shape).
 */
const VARIANTS: Record<Variant, { edge: string; fill: string; sweep: string; text: string; glow: string }> = {
  volt: {
    edge: "bg-volt",
    fill: "bg-volt",
    sweep: "bg-bone",
    text: "text-ink",
    glow: "hover:drop-shadow-[0_0_14px_rgb(255_46_147/0.6)]",
  },
  cyan: {
    edge: "bg-cyan",
    fill: "bg-cyan",
    sweep: "bg-bone",
    text: "text-ink",
    glow: "hover:drop-shadow-[0_0_14px_rgb(34_234_255/0.55)]",
  },
  bone: {
    edge: "bg-bone",
    fill: "bg-bone",
    sweep: "bg-volt",
    text: "text-ink",
    glow: "hover:drop-shadow-[0_0_14px_rgb(255_46_147/0.5)]",
  },
  ghost: {
    edge: "bg-line-strong group-hover/btn:bg-bone",
    fill: "bg-ink/60",
    sweep: "bg-bone",
    text: "text-bone group-hover/btn:text-ink",
    glow: "hover:drop-shadow-[0_0_12px_rgb(243_241_255/0.25)]",
  },
  dark: {
    edge: "bg-line",
    fill: "bg-char",
    sweep: "bg-steel",
    text: "text-bone",
    glow: "",
  },
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[11px]",
  md: "h-11 px-6 text-xs",
  lg: "h-14 px-8 text-[13px]",
  xl: "h-16 px-10 text-sm",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  iconLeft?: ReactNode;
  block?: boolean;
}

const classes = ({ variant = "volt", size = "md", block, className }: Omit<BaseProps, "children">) =>
  cn(
    "group/btn relative isolate inline-flex select-none items-center justify-center gap-2.5 font-wide font-extrabold uppercase italic tracking-[0.14em] transition-[filter,transform,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100",
    VARIANTS[variant].text,
    VARIANTS[variant].glow,
    SIZES[size],
    block && "w-full",
    className,
  );

function Inner({ children, icon, iconLeft, variant = "volt" }: Pick<BaseProps, "children" | "icon" | "iconLeft" | "variant">) {
  const v = VARIANTS[variant];
  return (
    <>
      <span aria-hidden className={cn("clip-angle absolute inset-0 -z-10 transition-colors duration-200", v.edge)}>
        <span className={cn("clip-angle absolute inset-px overflow-hidden", v.fill)}>
          <span
            className={cn(
              "absolute inset-y-0 -left-[15%] w-[130%] -translate-x-[110%] -skew-x-[24deg] transition-transform duration-300 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover/btn:translate-x-0 group-disabled/btn:hidden",
              v.sweep,
            )}
          />
        </span>
      </span>
      {iconLeft && <span className="relative">{iconLeft}</span>}
      <span className="relative transition-transform duration-200 group-hover/btn:translate-x-1">{children}</span>
      {icon && (
        <span className="relative inline-grid overflow-hidden">
          <span className="col-start-1 row-start-1 transition-transform duration-200 ease-in group-hover/btn:translate-x-[160%]">{icon}</span>
          <span className="col-start-1 row-start-1 -translate-x-[160%] transition-transform duration-200 ease-out group-hover/btn:translate-x-0 group-hover/btn:delay-100">
            {icon}
          </span>
        </span>
      )}
    </>
  );
}

export function Button(props: BaseProps & { silent?: boolean } & Omit<ComponentProps<"button">, "children">) {
  const { variant, size, className, children, icon, iconLeft, block, silent, onClick, type = "button", ...rest } = props;
  return (
    <button
      type={type}
      {...rest}
      onClick={(e) => {
        if (!silent) sound.play("select");
        onClick?.(e);
      }}
      className={classes({ variant, size, block, className })}
    >
      <Inner icon={icon} iconLeft={iconLeft} variant={variant}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink(props: BaseProps & { href: string } & Omit<ComponentProps<typeof Link>, "children" | "href">) {
  const { variant, size, className, children, icon, iconLeft, block, href, ...rest } = props;
  return (
    <Link href={href} {...rest} className={classes({ variant, size, block, className })}>
      <Inner icon={icon} iconLeft={iconLeft} variant={variant}>
        {children}
      </Inner>
    </Link>
  );
}
