"use client";
import { COLORS } from "@/data/colors";
import { garmentPhoto, VIEWBOX, viewBoxFor } from "@/lib/garment";
import type { ColorId, GarmentView, Silhouette } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GarmentImageProps {
  silhouette: Silhouette;
  color: ColorId;
  /** Which face to show. "detail" and sleeve views crop the front photo. */
  view?: GarmentView;
  className?: string;
  /** Adds a soft floor shadow. Disable for tiny thumbnails. */
  rich?: boolean;
}

/**
 * Photographic garment. Full views letterbox the 5:6 photo inside the box
 * (like SVG "meet"); detail/sleeve views crop a square region of the front.
 */
export function GarmentImage({ silhouette, color, view = "front", className, rich = true }: GarmentImageProps) {
  const face = view === "back" ? "back" : "front";
  const src = garmentPhoto(silhouette, color, face);
  const alt = `${COLORS[color].name} garment, ${face} view`;
  const shadow = rich ? "drop-shadow(0 18px 24px rgba(0,0,0,0.55))" : undefined;

  if (view === "front" || view === "back") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} draggable={false} className={cn("select-none object-contain", className)} style={{ filter: shadow }} />
    );
  }

  const [x, y, w, h] = viewBoxFor(silhouette, view).split(" ").map(Number);
  return (
    <div className={cn("relative overflow-hidden", className)} role="img" aria-label={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute max-w-none select-none"
        style={{
          width: `${(VIEWBOX.w / w) * 100}%`,
          height: `${(VIEWBOX.h / h) * 100}%`,
          left: `${(-x / w) * 100}%`,
          top: `${(-y / h) * 100}%`,
          filter: shadow,
        }}
      />
    </div>
  );
}
