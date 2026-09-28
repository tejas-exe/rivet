import type { Design } from "./types";
import { clamp, round1 } from "./utils";

export const MIN_DESIGN_IN = 1;

/** Axis-aligned bounds of a rotated artwork. */
export function rotatedBounds(w: number, h: number, rotationDeg: number) {
  const r = (rotationDeg * Math.PI) / 180;
  const c = Math.abs(Math.cos(r));
  const s = Math.abs(Math.sin(r));
  return { bw: w * c + h * s, bh: w * s + h * c };
}

/**
 * Keeps an artwork fully inside its printable area: shrinks it if its
 * rotated bounds are too large, then clamps the centre. Dimensions are
 * quantised to 0.1" so pricing matches the readout exactly.
 */
export function constrainDesign(d: Design, zoneW: number, zoneH: number): Design {
  let { width, height } = d;
  const { bw, bh } = rotatedBounds(width, height, d.rotation);
  const fit = Math.min(1, zoneW / bw, zoneH / bh);
  if (fit < 1) {
    width *= fit;
    height *= fit;
  }
  width = Math.max(MIN_DESIGN_IN, Math.floor(width * 10 + 1e-6) / 10);
  height = Math.max(MIN_DESIGN_IN, Math.floor(height * 10 + 1e-6) / 10);
  const b = rotatedBounds(width, height, d.rotation);
  const x = clamp(d.x, Math.min(b.bw / 2, zoneW / 2), Math.max(zoneW - b.bw / 2, zoneW / 2));
  const y = clamp(d.y, Math.min(b.bh / 2, zoneH / 2), Math.max(zoneH - b.bh / 2, zoneH / 2));
  return { ...d, width, height, x, y };
}

/** Chest-print sized default so a fresh upload doesn't swamp an all-over zone. */
const DEFAULT_MAX_IN = { w: 11, h: 14 };

/** Size a freshly uploaded artwork to ~60% of the zone (capped), keeping its aspect. */
export function initialSize(aspect: number, zoneW: number, zoneH: number) {
  const maxW = Math.min(zoneW * 0.62, DEFAULT_MAX_IN.w);
  const maxH = Math.min(zoneH * 0.62, DEFAULT_MAX_IN.h);
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  return { width: round1(Math.max(MIN_DESIGN_IN, w)), height: round1(Math.max(MIN_DESIGN_IN, h)) };
}

export const normalizeAngle = (deg: number) => {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return a;
};

/** Magnetic snapping to 0/45/90… like a game editor. */
export function snapAngle(deg: number, threshold = 4) {
  const a = normalizeAngle(deg);
  const nearest = Math.round(a / 45) * 45;
  return Math.abs(a - nearest) <= threshold ? normalizeAngle(nearest) : a;
}
