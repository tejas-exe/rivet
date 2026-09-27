"use client";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

type Variant = "volt" | "bone" | "ghost" | "dark";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  volt: "bg-volt text-ink hover:bg-bone clip-notch-sm",
  bone: "bg-bone text-ink hover:bg-volt clip-notch-sm",
  ghost: "border border-line-strong text-bone hover:border-bone hover:bg-bone hover:text-ink",
  dark: "bg-char text-bone hover:bg-steel border border-line",
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
    "group/btn relative inline-flex select-none items-center justify-center gap-2.5 font-wide font-bold uppercase tracking-[0.12em] transition-[background-color,color,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
    VARIANTS[variant],
    SIZES[size],
    block && "w-full",
    className,
  );

const Inner = ({ children, icon, iconLeft }: Pick<BaseProps, "children" | "icon" | "iconLeft">) => (
  <>
    {iconLeft}
    <span>{children}</span>
    {icon && <span className="transition-transform duration-300 group-hover/btn:translate-x-1">{icon}</span>}
  </>
);

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
      <Inner icon={icon} iconLeft={iconLeft}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink(props: BaseProps & { href: string } & Omit<ComponentProps<typeof Link>, "children" | "href">) {
  const { variant, size, className, children, icon, iconLeft, block, href, ...rest } = props;
  return (
    <Link href={href} {...rest} className={classes({ variant, size, block, className })}>
      <Inner icon={icon} iconLeft={iconLeft}>
        {children}
      </Inner>
    </Link>
  );
}
