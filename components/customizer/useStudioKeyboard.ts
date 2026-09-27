"use client";
import { useEffect } from "react";
import { COLOR_ORDER, SIZES } from "@/data/colors";
import { getProduct, PRODUCTS } from "@/data/products";
import { ZONE_ORDER } from "@/lib/garment";
import { sound } from "@/lib/sound";
import { isZonePanel, PANELS, useCustomizer } from "@/store/customizer";
import { useStudioUI } from "@/store/studio";
import { usePrefs } from "@/store/ui";

const cycle = <T,>(list: T[], current: T, dir: number) => list[(list.indexOf(current) + dir + list.length) % list.length];

/** Game-style keyboard control of the studio. */
export function useStudioKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (t as HTMLInputElement).type !== "range") || t.isContentEditable) return;
      if (t.tagName === "INPUT" && e.key.startsWith("Arrow")) return; // let sliders use arrows
      const ui = useStudioUI.getState();
      if (ui.summaryOpen) return;
      const s = useCustomizer.getState();
      const product = getProduct(s.productSlug)!;
      const sel = s.selectedId ? ZONE_ORDER.flatMap((z) => s.designs[z]).find((d) => d.id === s.selectedId) : undefined;
      const k = e.key.toLowerCase();
      const step = e.shiftKey ? 1 : 0.1;
      let handled = true;

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const ids = PANELS.map((p) => p.id);
        s.setPanel(cycle(ids, s.panel, e.key === "ArrowDown" ? 1 : -1));
        sound.play("select");
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const dir = e.key === "ArrowRight" ? 1 : -1;
        if (s.panel === "product") {
          s.setProduct(cycle(PRODUCTS.map((p) => p.slug), s.productSlug, dir));
          sound.play("whoosh");
        } else if (s.panel === "color") {
          s.setColor(cycle(COLOR_ORDER.filter((c) => product.colors.includes(c)), s.color, dir));
          sound.play("select");
        } else if (s.panel === "size") {
          s.setSize(cycle(SIZES.filter((z) => product.sizes.includes(z)), s.size, dir));
          sound.play("select");
        } else if (s.panel === "design") {
          s.setActiveZone(cycle(ZONE_ORDER, s.activeZone, dir));
          sound.play("select");
        } else if (isZonePanel(s.panel) && s.designs[s.panel].length) {
          const ids = s.designs[s.panel].map((d) => d.id);
          s.select(s.selectedId && ids.includes(s.selectedId) ? cycle(ids, s.selectedId, dir) : ids[0]);
          sound.play("tick");
        } else handled = false;
      } else if (["1", "2", "3", "4"].includes(e.key) && !e.metaKey && !e.ctrlKey) {
        s.setPanel(ZONE_ORDER[+e.key - 1]);
        sound.play("select");
      } else if (sel && ["w", "a", "s", "d"].includes(k) && !e.metaKey && !e.ctrlKey) {
        const dx = k === "a" ? -step : k === "d" ? step : 0;
        const dy = k === "w" ? -step : k === "s" ? step : 0;
        s.updateDesign(sel.id, { x: sel.x + dx, y: sel.y + dy });
      } else if (sel && (k === "q" || k === "e")) {
        s.updateDesign(sel.id, { rotation: sel.rotation + (k === "q" ? -1 : 1) * (e.shiftKey ? 15 : 5) });
      } else if (sel && (e.key === "[" || e.key === "]")) {
        const f = e.key === "]" ? 1.05 : 0.95;
        s.updateDesign(sel.id, { width: sel.width * f, height: sel.height * f });
      } else if (sel && (e.key === "Delete" || e.key === "Backspace")) {
        s.removeDesign(sel.id);
        sound.play("tick");
      } else if (sel && k === "d" && (e.metaKey || e.ctrlKey)) {
        s.duplicateDesign(sel.id);
        sound.play("drop");
      } else if (sel && k === "c") {
        s.centerDesign(sel.id);
        sound.play("select");
      } else if (e.key === "Escape") {
        if (ui.helpOpen) ui.setHelp(false);
        else s.select(null);
      } else if (k === "f") {
        ui.setSummary(true);
        sound.play("confirm");
      } else if (k === "r") {
        ui.requestRecenter();
      } else if (e.key === "?") {
        ui.setHelp(!ui.helpOpen);
      } else if (k === "m") {
        usePrefs.getState().toggleSound();
      } else handled = false;

      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
