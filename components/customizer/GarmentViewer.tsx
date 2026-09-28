"use client";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { Minus, Move3d, Plus, RefreshCcw, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { zonesOnFace } from "@/components/garment/GarmentPreview";
import { COLORS } from "@/data/colors";
import { getProduct } from "@/data/products";
import { cameraFor, ZONE_LABELS, ZONE_ORDER } from "@/lib/garment";
import { sound } from "@/lib/sound";
import type { PrintZone } from "@/lib/types";
import { clamp, cn } from "@/lib/utils";
import { isZonePanel, useCustomizer } from "@/store/customizer";
import { useStudioUI } from "@/store/studio";
import { ZoneLayer } from "./DesignEditor";
import { studioSignals, TurntableGarment } from "./TurntableGarment";
import { useArtworkUpload } from "./useArtworkUpload";

const StudioEnvironment = dynamic(() => import("./StudioEnvironment"), { ssr: false });
const CAMERA_SPRING = { type: "spring" as const, stiffness: 70, damping: 18, mass: 1 };

/** Isolated so camera-angle ticks don't re-render the whole stage. */
function CamReadout({ rotY }: { rotY: MotionValue<number> }) {
  const [deg, setDeg] = useState(0);
  useMotionValueEvent(rotY, "change", (v) => {
    const d = ((Math.round(v / 5) * 5) % 360 + 360) % 360;
    setDeg((prev) => (prev === d ? prev : d));
  });
  return <p>Cam / {String(deg).padStart(3, "0")}°</p>;
}

export function GarmentViewer({ className }: { className?: string }) {
  const productSlug = useCustomizer((s) => s.productSlug);
  const color = useCustomizer((s) => s.color);
  const activeZone = useCustomizer((s) => s.activeZone);
  const panel = useCustomizer((s) => s.panel);
  const setPanel = useCustomizer((s) => s.setPanel);
  const setActiveZone = useCustomizer((s) => s.setActiveZone);
  const select = useCustomizer((s) => s.select);
  const recenter = useStudioUI((s) => s.recenter);
  const product = getProduct(productSlug)!;
  const silhouette = product.silhouette;

  const stageRef = useRef<HTMLDivElement>(null);
  const rotY = useMotionValue(0);
  const camZoom = useMotionValue(1);
  const userZoom = useMotionValue(1);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const zoom = useTransform(() => camZoom.get() * userZoom.get());
  const x = useTransform(() => `${panX.get() * zoom.get() * 100}%`);
  const y = useTransform(() => `${panY.get() * zoom.get() * 100}%`);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [dragging, setDragging] = useState(false);
  const [dropHover, setDropHover] = useState(false);
  const upload = useArtworkUpload();
  const firstFrame = useRef(true);

  useMotionValueEvent(rotY, "change", (v) => {
    studioSignals.rotY = v;
    const f = Math.cos((v * Math.PI) / 180) >= 0 ? "front" : "back";
    setFacing((prev) => (prev === f ? prev : f));
  });
  useMotionValueEvent(zoom, "change", (z) => stageRef.current?.style.setProperty("--inv-zoom", String(1 / z)));

  const frame = (zone: PrintZone, quiet = false) => {
    const cam = cameraFor(silhouette, zone);
    const cur = rotY.get();
    const target = cam.rotateY + 360 * Math.round((cur - cam.rotateY) / 360);
    if (!quiet && Math.abs(target - cur) > 5) sound.play("whoosh");
    animate(rotY, target, CAMERA_SPRING);
    animate(camZoom, cam.zoom, CAMERA_SPRING);
    animate(userZoom, 1, CAMERA_SPRING);
    animate(panX, cam.panX, CAMERA_SPRING);
    animate(panY, cam.panY, CAMERA_SPRING);
  };

  // Camera follows the active print zone (FRONT → front, BACK → spin around…)
  useEffect(() => {
    frame(activeZone, firstFrame.current);
    firstFrame.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeZone, silhouette, recenter]);

  // Wheel zoom (non-passive so the page doesn't scroll).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      userZoom.set(clamp(userZoom.get() * (1 - e.deltaY * 0.0015), 0.6, 2.6));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [userZoom]);

  // Drag anywhere on the stage to orbit the garment.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startRot = rotY.get();
    let moved = false;
    let lastX = e.clientX;
    let lastT = performance.now();
    let velocity = 0;
    rotY.stop();
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        setDragging(true);
      }
      if (moved) {
        rotY.set(startRot + dx * 0.45);
        const now = performance.now();
        velocity = ((ev.clientX - lastX) * 0.45) / Math.max(1, now - lastT);
        lastX = ev.clientX;
        lastT = now;
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setDragging(false);
      if (!moved) {
        select(null);
        return;
      }
      // Throw with a little inertia, then settle on the nearest face.
      const projected = rotY.get() + velocity * 180;
      const face = Math.cos((projected * Math.PI) / 180) >= 0 ? "front" : "back";
      const current = useCustomizer.getState().activeZone;
      const desired: PrintZone = face === "back" ? "back" : current === "leftSleeve" || current === "rightSleeve" ? current : "front";
      if (desired === current) {
        const cam = cameraFor(silhouette, desired);
        animate(rotY, cam.rotateY + 360 * Math.round((projected - cam.rotateY) / 360), CAMERA_SPRING);
      } else {
        rotY.set(projected);
        if (isZonePanel(useCustomizer.getState().panel)) setPanel(desired);
        else setActiveZone(desired);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const zoomBy = (k: number) => {
    sound.play("tick");
    animate(userZoom, clamp(userZoom.get() * k, 0.6, 2.6), { duration: 0.35 });
  };

  const editing = isZonePanel(panel) || panel === "design";

  return (
    <div
      ref={stageRef}
      className={cn("relative isolate overflow-hidden bg-ink select-none", dragging ? "cursor-grabbing" : "cursor-grab", className)}
      style={{ containerType: "size", touchAction: "none" }}
      onPointerDown={onPointerDown}
      onDragOver={(e) => {
        e.preventDefault();
        setDropHover(true);
      }}
      onDragLeave={() => setDropHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropHover(false);
        void upload.handleFiles(e.dataTransfer.files);
      }}
    >
      {/* Garage backdrop: navy void, neon side washes, overhead tubes, haze */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_38%,#171430_0%,#0b0a18_48%,#06060c_82%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_40%_70%_at_0%_60%,rgb(255_46_147/0.20),transparent_70%),radial-gradient(ellipse_40%_70%_at_100%_55%,rgb(34_234_255/0.16),transparent_70%)]" />
      <div className="absolute inset-0 -z-10">
        <StudioEnvironment />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] bg-[radial-gradient(ellipse_32%_75%_at_50%_0%,rgb(244_238_255/0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-[linear-gradient(to_top,rgb(139_92_255/0.10),transparent)]" />
      {/* overhead neon tubes */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 flex -translate-x-1/2 gap-[18cqw]" aria-hidden>
        <span className="h-[3px] w-[16cqw] bg-volt/80 shadow-[0_0_18px_4px_rgb(255_46_147/0.45)]" />
        <span className="h-[3px] w-[16cqw] bg-cyan/80 shadow-[0_0_18px_4px_rgb(34_234_255/0.4)]" />
      </div>
      {/* side edge strips */}
      <span className="pointer-events-none absolute top-[18%] bottom-[18%] left-0 -z-10 w-[2px] bg-gradient-to-b from-transparent via-volt/70 to-transparent" aria-hidden />
      <span className="pointer-events-none absolute top-[18%] right-0 bottom-[18%] -z-10 w-[2px] bg-gradient-to-b from-transparent via-cyan/70 to-transparent" aria-hidden />
      <div className="scanlines pointer-events-none absolute inset-0 -z-10 opacity-40" aria-hidden />

      {/* Garment on its camera rig */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1800px" }}>
        <motion.div style={{ x, y, scale: zoom, width: "min(86cqw, calc(80cqh * 5 / 6))" }} className="preserve-3d relative -mt-[2cqh]">
          <TurntableGarment
            silhouette={silhouette}
            color={color}
            rotateY={rotY}
            renderFace={(face) => (
              <>
                {zonesOnFace(silhouette, face).map((z) => (
                  <ZoneLayer key={z} silhouette={silhouette} zone={z} active={editing && z === activeZone} />
                ))}
              </>
            )}
          />
          {/* Colour-change light sweep */}
          <AnimatePresence>
            <motion.div
              key={color}
              className="pointer-events-none absolute inset-0 mix-blend-overlay"
              initial={{ backgroundPosition: "-150% 0", opacity: 0 }}
              animate={{ backgroundPosition: "250% 0", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              style={{ backgroundImage: "linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)", backgroundSize: "60% 100%", backgroundRepeat: "no-repeat" }}
            />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* HUD: print zone / view indicator */}
      <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 text-center md:top-4">
        <p className="label flex items-center justify-center gap-2 text-fog">
          <span className="h-px w-5 bg-cyan/60" /> {editing ? "Print zone" : "View"} <span className="h-px w-5 bg-cyan/60" />
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={`${facing}-${activeZone}-${editing}`}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.18 }}
            className="display text-2xl whitespace-nowrap text-bone md:text-3xl"
          >
            {editing || activeZone === "leftSleeve" || activeZone === "rightSleeve" ? ZONE_LABELS[activeZone] : facing}
            {editing && <span className="ml-2 font-mono text-xs not-italic text-cyan">/ {String(ZONE_ORDER.indexOf(activeZone) + 1).padStart(2, "0")}</span>}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="pointer-events-none absolute top-4 left-4 hidden md:block xl:left-5">
        <p className="label flex items-center gap-2 text-bone">
          <span className="h-1.5 w-1.5 animate-pulse bg-volt shadow-[0_0_8px_rgb(255_46_147/0.9)]" /> Custom studio
        </p>
        <p className="label mt-1 text-fog">Build / {product.id.replace("p-", "")}</p>
        <div className="mt-3 border-l-2 border-volt pl-2.5">
          <p className="label text-[9px]! text-fog">Garment</p>
          <p className="display text-xl">{product.buildName}</p>
          <p className="label mt-1 text-[9px]! text-fog">
            Paint <span className="text-cyan">{COLORS[color].name}</span>
          </p>
        </div>
      </div>
      <div className="label pointer-events-none absolute top-4 right-4 hidden text-right text-[9px]! text-fog xl:block">
        <CamReadout rotY={rotY} />
        <p className="mt-1">Garage 02 — Bay 04</p>
      </div>

      {/* Camera controls */}
      <div className="absolute right-3 bottom-3 flex flex-col gap-1" onPointerDown={(e) => e.stopPropagation()}>
        {[
          { label: "Zoom in", onClick: () => zoomBy(1.2), icon: <Plus size={15} /> },
          { label: "Zoom out", onClick: () => zoomBy(1 / 1.2), icon: <Minus size={15} /> },
          { label: "Reset camera", onClick: () => frame(useCustomizer.getState().activeZone), icon: <RefreshCcw size={14} /> },
        ].map((b) => (
          <button
            key={b.label}
            onClick={b.onClick}
            aria-label={b.label}
            className="clip-angle-sm grid h-10 w-10 place-items-center bg-steel/70 text-bone-dim backdrop-blur transition-colors hover:bg-cyan hover:text-ink"
          >
            {b.icon}
          </button>
        ))}
      </div>
      <div className="label pointer-events-none absolute bottom-4 left-4 hidden items-center gap-2 text-fog md:flex">
        <Move3d size={13} className="text-cyan" /> Drag to rotate <span className="opacity-60">///</span> Scroll to zoom
      </div>

      <AnimatePresence>
        {dropHover && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-3 grid place-items-center border-2 border-dashed border-cyan bg-cyan/10">
            <p className="label flex items-center gap-2 text-cyan">
              <Upload size={14} /> Drop to place on {ZONE_LABELS[activeZone]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <input {...upload.inputProps} />
    </div>
  );
}
