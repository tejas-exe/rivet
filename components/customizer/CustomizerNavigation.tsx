"use client";
import { motion } from "framer-motion";
import { COLORS } from "@/data/colors";
import { getProduct } from "@/data/products";
import { summarizeZone } from "@/lib/pricing";
import { formatDims } from "@/lib/format";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { isZonePanel, PANELS, useCustomizer, type PanelId } from "@/store/customizer";

function usePanelValue() {
  const s = useCustomizer();
  return (id: PanelId): string => {
    if (id === "product") return getProduct(s.productSlug)?.buildName ?? "";
    if (id === "color") return COLORS[s.color].name;
    if (id === "size") return s.size;
    if (id === "design") {
      const n = Object.values(s.designs).reduce((a, l) => a + l.length, 0);
      return n ? `${n} layer${n > 1 ? "s" : ""}` : "Add art";
    }
    if (isZonePanel(id)) {
      const sum = summarizeZone(id, s.designs[id]);
      if (!sum) return "—";
      return sum.count > 1 ? `${sum.count} graphics` : formatDims(sum.width, sum.height);
    }
    return "";
  };
}

/** Desktop: vertical game-menu list. */
export function CustomizerNavigation() {
  const panel = useCustomizer((s) => s.panel);
  const setPanel = useCustomizer((s) => s.setPanel);
  const designs = useCustomizer((s) => s.designs);
  const value = usePanelValue();

  return (
    <nav className="flex h-full flex-col" aria-label="Customization categories">
      <p className="label mb-4 px-5 text-fog">Customize</p>
      <ul className="flex-1">
        {PANELS.map((p, i) => {
          const active = p.id === panel;
          const hasArt = isZonePanel(p.id) && designs[p.id].length > 0;
          return (
            <li key={p.id}>
              {i === 3 && <p className="label mt-4 mb-2 px-5 text-[9px]! text-fog">Print locations</p>}
              <button
                onClick={() => {
                  if (p.id !== panel) sound.play("select");
                  setPanel(p.id);
                }}
                onMouseEnter={() => sound.play("hover")}
                aria-current={active}
                className={cn("group relative flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors", active ? "text-ink" : "text-bone-dim hover:text-bone")}
              >
                {active && <motion.span layoutId="nav-active" className="absolute inset-y-0 left-0 right-3 bg-volt clip-slant" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <span className={cn("relative font-mono text-[10px]", active ? "text-ink/60" : "text-fog")}>{String(i + 1).padStart(2, "0")}</span>
                <span className="relative flex-1 font-wide text-[13px] font-black tracking-wide uppercase transition-transform duration-300 group-hover:translate-x-1">
                  {p.label}
                </span>
                <span className={cn("relative max-w-[88px] truncate font-mono text-[10px] uppercase", active ? "text-ink/70" : hasArt ? "text-volt" : "text-fog")}>{value(p.id)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="label space-y-1 border-t border-line px-5 pt-4 text-[9px]! text-fog">
        <p>↑ ↓ Category · ← → Option</p>
        <p>WASD Nudge · Q E Rotate · [ ] Scale</p>
        <p>Del Remove · C Center · F Finish · ? Help</p>
      </div>
    </nav>
  );
}

/** Mobile: horizontal category strip. */
export function CustomizerTabs() {
  const panel = useCustomizer((s) => s.panel);
  const setPanel = useCustomizer((s) => s.setPanel);
  const designs = useCustomizer((s) => s.designs);
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto border-y border-line bg-coal px-2 py-2" role="tablist" aria-label="Customization categories">
      {PANELS.map((p) => {
        const active = p.id === panel;
        const hasArt = isZonePanel(p.id) && designs[p.id].length > 0;
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={active}
            onClick={() => {
              sound.play("select");
              setPanel(p.id);
            }}
            ref={(el) => {
              if (active && el) el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
            }}
            className={cn("relative shrink-0 px-3.5 py-2 font-wide text-[11px] font-black tracking-wide uppercase", active ? "text-ink" : "text-bone-dim")}
          >
            {active && <motion.span layoutId="tab-active" className="absolute inset-0 bg-volt" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className="relative flex items-center gap-1.5">
              {p.short}
              {hasArt && <span className={cn("h-1 w-1", active ? "bg-ink" : "bg-volt")} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
