"use client";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Counts smoothly to a new value and flashes lime (up) / orange (down). */
export function AnimatedNumber({
  value,
  format = formatINR,
  className,
  flash = true,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  flash?: boolean;
}) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(v));
  const prev = useRef(value);
  const [dir, setDir] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prev.current === value) return;
    setDir(value > prev.current ? "up" : "down");
    prev.current = value;
    const controls = animate(mv, value, { duration: 0.55, ease: [0.22, 1, 0.36, 1] });
    const t = setTimeout(() => setDir(null), 650);
    return () => {
      controls.stop();
      clearTimeout(t);
    };
  }, [value, mv]);

  return (
    <motion.span
      className={cn(
        "tabular-nums transition-colors duration-500",
        flash && dir === "up" && "text-volt",
        flash && dir === "down" && "text-alert",
        className,
      )}
    >
      {text}
    </motion.span>
  );
}
