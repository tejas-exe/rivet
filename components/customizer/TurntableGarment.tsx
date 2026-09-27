"use client";
import { motion, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { GarmentImage } from "@/components/garment/GarmentImage";
import type { ColorId, Silhouette } from "@/lib/types";

/**
 * Mutable per-frame signals shared between the DOM garment and the WebGL
 * environment (turntable). Read in rAF loops — never drives React renders.
 */
export const studioSignals = { rotY: 0 };

/**
 * 2.5D garment: a front face and a back face in a preserve-3d turntable with
 * a few darkened photo slices between them to fake fabric thickness.
 *
 * This is the renderer boundary — a GLB/GLTF implementation can replace this
 * component while keeping the same props (silhouette, color, rotateY, faces).
 */
export function TurntableGarment({
  silhouette,
  color,
  rotateY,
  renderFace,
  className,
}: {
  silhouette: Silhouette;
  color: ColorId;
  rotateY: MotionValue<number>;
  renderFace?: (face: "front" | "back") => ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={`preserve-3d relative aspect-[5/6] ${className ?? ""}`} style={{ rotateY }}>
      <div className="backface-hidden absolute inset-0" style={{ transform: "translateZ(4px)" }}>
        <GarmentImage silhouette={silhouette} color={color} view="front" className="absolute inset-0 h-full w-full" />
        {renderFace?.("front")}
      </div>
      <div className="backface-hidden absolute inset-0" style={{ transform: "rotateY(180deg) translateZ(4px)" }}>
        <GarmentImage silhouette={silhouette} color={color} view="back" className="absolute inset-0 h-full w-full" />
        {renderFace?.("back")}
      </div>
    </motion.div>
  );
}
