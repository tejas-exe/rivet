"use client";
import { useId, type CSSProperties, type ReactNode } from "react";
import { garmentPhoto, SILHOUETTES, UNITS_PER_INCH, VIEWBOX, ZONE_ORDER } from "@/lib/garment";
import type { ColorId, Design, DesignsByZone, PrintZone, Silhouette } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GarmentImage } from "./GarmentImage";

/** Absolute box of a print zone over the 500×600 garment, in percentages. */
export function zoneBoxStyle(silhouette: Silhouette, zone: PrintZone): CSSProperties {
  const z = SILHOUETTES[silhouette].zones[zone];
  return {
    left: `${(z.x / VIEWBOX.w) * 100}%`,
    top: `${(z.y / VIEWBOX.h) * 100}%`,
    width: `${((z.widthIn * UNITS_PER_INCH) / VIEWBOX.w) * 100}%`,
    height: `${((z.heightIn * UNITS_PER_INCH) / VIEWBOX.h) * 100}%`,
  };
}

/** Position of one artwork inside its zone box, in percentages. */
export function designBoxStyle(d: Design, zoneW: number, zoneH: number): CSSProperties {
  return {
    left: `${((d.x - d.width / 2) / zoneW) * 100}%`,
    top: `${((d.y - d.height / 2) / zoneH) * 100}%`,
    width: `${(d.width / zoneW) * 100}%`,
    height: `${(d.height / zoneH) * 100}%`,
    transform: `rotate(${d.rotation}deg)`,
  };
}

/**
 * Clips its children (laid out in the zone's own box) to the garment
 * silhouette, using the photo's alpha as a mask — prints stop at the seams.
 */
export function GarmentClip({ silhouette, color, zone, children }: { silhouette: Silhouette; color: ColorId; zone: PrintZone; children: ReactNode }) {
  const z = SILHOUETTES[silhouette].zones[zone];
  const zw = z.widthIn * UNITS_PER_INCH;
  const zh = z.heightIn * UNITS_PER_INCH;
  const mask = `url(${garmentPhoto(silhouette, color, z.face)})`;
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${(-z.x / zw) * 100}%`,
        top: `${(-z.y / zh) * 100}%`,
        width: `${(VIEWBOX.w / zw) * 100}%`,
        height: `${(VIEWBOX.h / zh) * 100}%`,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    >
      <div className="absolute" style={zoneBoxStyle(silhouette, zone)}>
        {children}
      </div>
    </div>
  );
}

/** Printed artwork for one zone: images + fabric shading, clipped to the garment. */
export function PrintLayer({ silhouette, color, zone, designs }: { silhouette: Silhouette; color: ColorId; zone: PrintZone; designs: Design[] }) {
  if (!designs.length) return null;
  const spec = SILHOUETTES[silhouette].zones[zone];
  return (
    <GarmentClip silhouette={silhouette} color={color} zone={zone}>
      {designs.map((d) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={d.id}
          src={d.src}
          alt=""
          draggable={false}
          className="absolute max-w-none select-none object-fill"
          style={designBoxStyle(d, spec.widthIn, spec.heightIn)}
        />
      ))}
      <PrintShading silhouette={silhouette} color={color} zone={zone} designs={designs} />
    </GarmentClip>
  );
}

export const zonesOnFace = (silhouette: Silhouette, face: "front" | "back") =>
  ZONE_ORDER.filter((z) => SILHOUETTES[silhouette].zones[z].face === face);

/** Brightness that maps each fabric's average tone to mid-gray for soft-light. */
const FABRIC_GAIN: Record<ColorId, number> = { white: 0.55, black: 5 };

/**
 * Lays the garment photo's folds and texture over the artwork (and only the
 * artwork — masked by each design's alpha, rotation included), so prints
 * read as pressed into the fabric rather than floating on top.
 */
export function PrintShading({ silhouette, color, zone, designs }: { silhouette: Silhouette; color: ColorId; zone: PrintZone; designs: Design[] }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (!designs.length) return null;
  const spec = SILHOUETTES[silhouette].zones[zone];
  const u = UNITS_PER_INCH;
  const W = spec.widthIn;
  const H = spec.heightIn;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" style={{ mixBlendMode: "soft-light" }} aria-hidden>
      <defs>
        <mask id={`m-${uid}`} maskUnits="userSpaceOnUse" x={-W} y={-H} width={W * 3} height={H * 3} style={{ maskType: "alpha" }}>
          {designs.map((d) => (
            <image
              key={d.id}
              href={d.src}
              x={d.x - d.width / 2}
              y={d.y - d.height / 2}
              width={d.width}
              height={d.height}
              preserveAspectRatio="none"
              transform={`rotate(${d.rotation} ${d.x} ${d.y})`}
            />
          ))}
        </mask>
        <filter id={`f-${uid}`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope={FABRIC_GAIN[color] * 1.5} intercept={-0.25} />
            <feFuncG type="linear" slope={FABRIC_GAIN[color] * 1.5} intercept={-0.25} />
            <feFuncB type="linear" slope={FABRIC_GAIN[color] * 1.5} intercept={-0.25} />
          </feComponentTransfer>
        </filter>
      </defs>
      <g mask={`url(#m-${uid})`}>
        <image
          href={garmentPhoto(silhouette, color, spec.face)}
          x={-spec.x / u}
          y={-spec.y / u}
          width={VIEWBOX.w / u}
          height={VIEWBOX.h / u}
          filter={`url(#f-${uid})`}
          preserveAspectRatio="none"
        />
      </g>
    </svg>
  );
}

interface GarmentPreviewProps {
  silhouette: Silhouette;
  color: ColorId;
  face?: "front" | "back";
  designs?: DesignsByZone;
  className?: string;
  rich?: boolean;
}

/** Non-interactive garment with printed artwork — cards, cart, summaries. */
export function GarmentPreview({ silhouette, color, face = "front", designs, className, rich = true }: GarmentPreviewProps) {
  return (
    <div className={cn("relative aspect-[5/6]", className)}>
      <GarmentImage silhouette={silhouette} color={color} view={face} rich={rich} className="absolute inset-0 h-full w-full" />
      {designs &&
        zonesOnFace(silhouette, face).map((zone) => {
          const list = designs[zone] ?? [];
          if (!list.length) return null;
          return (
            <div key={zone} className="absolute" style={zoneBoxStyle(silhouette, zone)}>
              <PrintLayer silhouette={silhouette} color={color} zone={zone} designs={list} />
            </div>
          );
        })}
    </div>
  );
}

/** Pick the face that actually has artwork for thumbnails. */
export function primaryFace(silhouette: Silhouette, designs?: DesignsByZone): "front" | "back" {
  if (!designs) return "front";
  const frontHas = zonesOnFace(silhouette, "front").some((z) => designs[z]?.length);
  const backHas = zonesOnFace(silhouette, "back").some((z) => designs[z]?.length);
  return !frontHas && backHas ? "back" : "front";
}
