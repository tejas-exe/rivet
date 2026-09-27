"use client";
import { Minus, Plus } from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const set = (v: number) => {
    sound.play("tick");
    onChange(Math.max(min, Math.min(max, v)));
  };
  return (
    <div className="inline-flex items-center border border-line-strong">
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => set(value - 1)} className={cn(h, "grid place-items-center text-bone hover:bg-char disabled:opacity-30")}>
        <Minus size={14} />
      </button>
      <span className={cn("grid place-items-center font-mono text-sm tabular-nums", size === "sm" ? "w-8" : "w-10")} aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => set(value + 1)} className={cn(h, "grid place-items-center text-bone hover:bg-char disabled:opacity-30")}>
        <Plus size={14} />
      </button>
    </div>
  );
}
