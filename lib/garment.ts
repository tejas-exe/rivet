/**
 * Garment geometry for the photo renderer.
 *
 * Every garment photo in /public/garments is a transparent 1000 × 1200 image
 * laid out on the same 500 × 600 unit canvas. Print zones are placed on that
 * canvas at 12.5 units per inch, so inches map 1:1 onto the photo.
 * FRONT / BACK zones cover the whole garment face (all-over print); artwork
 * is clipped to the garment silhouette so nothing prints off the fabric.
 * A future GLB/GLTF renderer only needs to honour the same `PrintZoneSpec`
 * inches + `CameraFocus` contract.
 */
import type { ColorId, GarmentView, PrintZone, Silhouette } from "./types";

export const VIEWBOX = { w: 500, h: 600 } as const;
export const UNITS_PER_INCH = 12.5;

export interface PrintZoneSpec {
  zone: PrintZone;
  label: string;
  /** Which face of the garment the zone is printed on. */
  face: "front" | "back";
  widthIn: number;
  heightIn: number;
  /** Top-left position in canvas units. */
  x: number;
  y: number;
}

export interface SilhouetteGeometry {
  /** Base name of the photo set: /garments/{photo}-{color}-{face}.webp */
  photo: "tee" | "hoodie";
  zones: Record<PrintZone, PrintZoneSpec>;
  detailViewBox: string;
  sleeveViewBox: { leftSleeve: string; rightSleeve: string };
}

export const ZONE_LABELS: Record<PrintZone, string> = {
  front: "Front",
  back: "Back",
  leftSleeve: "Left Sleeve",
  rightSleeve: "Right Sleeve",
};
export const ZONE_ORDER: PrintZone[] = ["front", "back", "leftSleeve", "rightSleeve"];

const zone = (z: PrintZone, face: "front" | "back", widthIn: number, heightIn: number, x: number, y: number): PrintZoneSpec => ({
  zone: z,
  label: ZONE_LABELS[z],
  face,
  widthIn,
  heightIn,
  x,
  y,
});

const mirrorX = (x: number, w: number) => VIEWBOX.w - x - w;

const tee: SilhouetteGeometry = {
  photo: "tee",
  zones: {
    front: zone("front", "front", 37.5, 38, 15.5, 63),
    back: zone("back", "back", 37.5, 38.5, 15.5, 59.5),
    // Wearer's left sleeve sits on the viewer's right in a front view.
    leftSleeve: zone("leftSleeve", "front", 3, 3, 410, 172),
    rightSleeve: zone("rightSleeve", "front", 3, 3, mirrorX(410, 37.5), 172),
  },
  detailViewBox: "160 50 180 180",
  sleeveViewBox: { leftSleeve: "320 70 180 180", rightSleeve: "0 70 180 180" },
};

const hoodie: SilhouetteGeometry = {
  photo: "hoodie",
  zones: {
    front: zone("front", "front", 31, 42.5, 56.5, 34),
    back: zone("back", "back", 30, 42.5, 62.5, 34.5),
    leftSleeve: zone("leftSleeve", "front", 2.5, 7, 378, 210),
    rightSleeve: zone("rightSleeve", "front", 2.5, 7, mirrorX(378, 31.25), 210),
  },
  detailViewBox: "150 30 200 200",
  sleeveViewBox: { leftSleeve: "310 150 190 190", rightSleeve: "0 150 190 190" },
};

export const SILHOUETTES: Record<Silhouette, SilhouetteGeometry> = {
  "oversized-tee": tee,
  "classic-tee": tee,
  hoodie,
};

export const getZone = (s: Silhouette, z: PrintZone) => SILHOUETTES[s].zones[z];

export const garmentPhoto = (s: Silhouette, color: ColorId, face: "front" | "back") =>
  `/garments/${SILHOUETTES[s].photo}-${color}-${face}.webp`;

export function viewBoxFor(s: Silhouette, view: GarmentView): string {
  const g = SILHOUETTES[s];
  if (view === "detail") return g.detailViewBox;
  if (view === "leftSleeve" || view === "rightSleeve") return g.sleeveViewBox[view];
  return `0 0 ${VIEWBOX.w} ${VIEWBOX.h}`;
}

// ───────────────────────── Studio camera ─────────────────────────
export interface CameraFocus {
  rotateY: number;
  zoom: number;
  /** Pan as a fraction of the garment box (applied before zoom). */
  panX: number;
  panY: number;
}

export function cameraFor(s: Silhouette, z: PrintZone): CameraFocus {
  if (z === "front") return { rotateY: 0, zoom: 1, panX: 0, panY: 0 };
  if (z === "back") return { rotateY: 180, zoom: 1, panX: 0, panY: 0 };
  const spec = getZone(s, z);
  const cx = spec.x + (spec.widthIn * UNITS_PER_INCH) / 2;
  const cy = spec.y + (spec.heightIn * UNITS_PER_INCH) / 2;
  // Photos are flat, so frame the sleeve head-on and keep the zoom within
  // what the source photo resolution can hold without going soft.
  return {
    rotateY: 0,
    zoom: 1.4,
    panX: -(cx - VIEWBOX.w / 2) / VIEWBOX.w,
    panY: -(cy - VIEWBOX.h / 2) / VIEWBOX.h,
  };
}
