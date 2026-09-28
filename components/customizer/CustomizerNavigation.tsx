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

/** Desktop: vertical game-menu list — `04  FRONT ━━━━━`. */
export function CustomizerNavigation() {
  const panel = useCustomizer((s) => s.panel);
  const setPanel = useCustomizer((s) => s.setPanel);
  const designs = useCustomizer((s) => s.designs);
  const value = usePanelValue();

  return (
    <nav className="flex h-full flex-col" aria-label="Customization categories">
      <div className="mb-5 px-5">
        <p className="label flex items-center gap-2 text-fog">
          <span className="h-1.5 w-1.5 bg-cyan shadow-[0_0_8px_rgb(34_234_255/0.9)]" /> Tuning menu
        </p>
        <p className="display mt-1 text-3xl">Customize</p>
      </div>
      <ul className="flex-1">
        {PANELS.map((p, i) => {
          const active = p.id === panel;
          const hasArt = isZonePanel(p.id) && designs[p.id].length > 0;
          return (
            <li key={p.id}>
              {i === 3 && (
                <p className="label mt-5 mb-2 flex items-center gap-2 px-5 text-[9px]! text-fog">
                  Print locations <span className="h-px flex-1 bg-line" />
                </p>
              )}
              <button
                onClick={() => {
                  if (p.id !== panel) sound.play("select");
                  setPanel(p.id);
                }}
                onMouseEnter={() => sound.play("hover")}
                aria-current={active}
                className={cn("group relative flex w-full items-center gap-3 overflow-hidden px-5 py-2.5 text-left transition-colors", active ? "text-bone" : "text-bone-dim/70 hover:text-bone")}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-volt/25 via-volt/5 to-transparent"
                    transition={{ type: "spring", stiffness: 520, damping: 42 }}
                  >
                    <span className="absolute inset-y-0 left-0 w-[3px] bg-volt shadow-[0_0_12px_rgb(255_46_147/0.9)]" />
                  </motion.span>
                )}
                <span className={cn("relative font-mono text-[10px] transition-colors", active ? "text-volt" : "text-fog group-hover:text-volt")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "relative font-wide text-[15px] font-extrabold tracking-wide uppercase italic transition-transform duration-200",
                    active ? "translate-x-1" : "group-hover:translate-x-1",
                  )}
                >
                  {p.label}
                </span>
                {/* Racing-line indicator */}
                <span className="relative flex h-px flex-1 items-center">
                  <motion.span
                    className="h-[2px] w-full origin-left bg-bone"
                    initial={false}
                    animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
                <span className={cn("relative max-w-[88px] truncate font-mono text-[10px] uppercase", active ? "text-bone" : hasArt ? "text-cyan" : "text-fog")}>{value(p.id)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="label space-y-1 border-t border-line px-5 pt-4 text-[9px]! text-fog">
        <p>
          <span className="text-bone-dim">↑ ↓</span> Category · <span className="text-bone-dim">← →</span> Option
        </p>
        <p>
          <span className="text-bone-dim">WASD</span> Nudge · <span className="text-bone-dim">Q E</span> Rotate · <span className="text-bone-dim">[ ]</span> Scale
        </p>
        <p>
          <span className="text-bone-dim">Del</span> Remove · <span className="text-bone-dim">C</span> Center · <span className="text-bone-dim">F</span> Finish · <span className="text-bone-dim">?</span> Help
        </p>
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
    <div className="no-scrollbar flex gap-0.5 overflow-x-auto border-y border-line bg-coal/95 px-2 py-2" role="tablist" aria-label="Customization categories">
      {PANELS.map((p, i) => {
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
            className={cn("relative flex min-h-11 shrink-0 items-center px-3.5 font-wide text-[12px] font-extrabold tracking-wide uppercase italic", active ? "text-ink" : "text-bone-dim")}
          >
            {active && <motion.span layoutId="tab-active" className="clip-angle-sm absolute inset-0 bg-volt shadow-[0_0_14px_rgb(255_46_147/0.5)]" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className="relative flex items-center gap-1.5">
              <span className={cn("font-mono text-[9px] not-italic", active ? "text-ink/60" : "text-fog")}>{String(i + 1).padStart(2, "0")}</span>
              {p.short}
              {hasArt && <span className={cn("h-1 w-1", active ? "bg-ink" : "bg-cyan")} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
