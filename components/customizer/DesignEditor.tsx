"use client";
import { ImagePlus, RotateCw } from "lucide-react";
import { useRef, useState } from "react";
import { designBoxStyle, PrintShading, zoneBoxStyle } from "@/components/garment/GarmentPreview";
import { snapAngle } from "@/lib/design";
import { formatDims } from "@/lib/format";
import { SILHOUETTES, type PrintZoneSpec } from "@/lib/garment";
import { sound } from "@/lib/sound";
import type { Design, PrintZone, Silhouette } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCustomizer } from "@/store/customizer";
import { useStudioUI, type Interaction } from "@/store/studio";
import { useArtworkUpload } from "./useArtworkUpload";

/** Keeps HUD chrome a constant on-screen size regardless of camera zoom. */
const counterScale = { transform: "scale(var(--inv-zoom, 1))" };
const SNAP_IN = 0.18;

function DesignItem({
  d,
  spec,
  zoneRef,
  active,
  selected,
  onGuides,
}: {
  d: Design;
  spec: PrintZoneSpec;
  zoneRef: React.RefObject<HTMLDivElement | null>;
  active: boolean;
  selected: boolean;
  onGuides: (g: { v: boolean; h: boolean }) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const update = useCustomizer((s) => s.updateDesign);
  const select = useCustomizer((s) => s.select);
  const setPanel = useCustomizer((s) => s.setPanel);
  const setInteraction = useStudioUI((s) => s.setInteraction);
  const interaction = useStudioUI((s) => s.interaction);

  const begin = (mode: Exclude<Interaction, null>) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    if (!active) {
      // Tapping artwork on another zone jumps the camera there.
      setPanel(d.zone);
      select(d.id);
      sound.play("select");
      return;
    }
    select(d.id);
    const zr = zoneRef.current!.getBoundingClientRect();
    const ux = spec.widthIn / zr.width;
    const uy = spec.heightIn / zr.height;
    const er = ref.current!.getBoundingClientRect();
    const cx = er.left + er.width / 2;
    const cy = er.top + er.height / 2;
    const start = { px: e.clientX, py: e.clientY, d: { ...d } };
    const startDist = Math.max(8, Math.hypot(e.clientX - cx, e.clientY - cy));
    const startAng = Math.atan2(e.clientY - cy, e.clientX - cx);
    setInteraction(mode);

    const move = (ev: PointerEvent) => {
      if (mode === "move") {
        let x = start.d.x + (ev.clientX - start.px) * ux;
        let y = start.d.y + (ev.clientY - start.py) * uy;
        const v = Math.abs(x - spec.widthIn / 2) < SNAP_IN;
        const h = Math.abs(y - spec.heightIn / 2) < SNAP_IN;
        if (v) x = spec.widthIn / 2;
        if (h) y = spec.heightIn / 2;
        onGuides({ v, h });
        update(d.id, { x, y });
      } else if (mode === "resize") {
        const k = Math.hypot(ev.clientX - cx, ev.clientY - cy) / startDist;
        update(d.id, { width: start.d.width * k, height: start.d.height * k });
      } else {
        const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
        update(d.id, { rotation: snapAngle(start.d.rotation + ((a - startAng) * 180) / Math.PI) });
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setInteraction(null);
      onGuides({ v: false, h: false });
      sound.play("tick");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const showChrome = active && selected;

  return (
    <div
      ref={ref}
      className={cn("absolute touch-none select-none", active ? "cursor-move" : "cursor-pointer")}
      style={designBoxStyle(d, spec.widthIn, spec.heightIn)}
      onPointerDown={begin("move")}
      role="button"
      aria-label={`${d.name} artwork, ${formatDims(d.width, d.height)}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.src} alt="" draggable={false} className="pointer-events-none h-full w-full object-fill" />
      {active && !selected && <div className="absolute inset-0 outline outline-1 -outline-offset-1 outline-transparent hover:outline-white/40" />}
      {showChrome && (
        <>
          <div className="pointer-events-none absolute inset-0 outline outline-1 outline-volt" style={{ outlineWidth: "calc(1.5px * var(--inv-zoom, 1))" }} />
          {(["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"] as const).map((pos, i) => (
            <span
              key={pos}
              onPointerDown={begin("resize")}
              className={cn("absolute h-2 w-2 touch-none border border-ink bg-volt", pos, i === 0 || i === 3 ? "cursor-nwse-resize" : "cursor-nesw-resize")}
              style={{ ...counterScale, width: 10, height: 10, margin: -1 }}
              aria-label="Resize"
            />
          ))}
          <div className="absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col items-center" style={{ transformOrigin: "bottom center" }}>
            <span
              onPointerDown={begin("rotate")}
              className="grid h-5 w-5 cursor-grab touch-none place-items-center rounded-full border border-volt bg-ink text-volt"
              style={counterScale}
              aria-label="Rotate"
            >
              <RotateCw size={10} />
            </span>
            <span className="h-3 w-px bg-volt" />
          </div>
          {interaction && (
            <div className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap" style={{ ...counterScale, transformOrigin: "top center" }}>
              <span className="label block bg-volt px-1.5 py-0.5 text-[9px]! font-bold text-ink" style={{ transform: `rotate(${-d.rotation}deg)` }}>
                {interaction === "rotate" ? `${Math.round(d.rotation)}°` : formatDims(d.width, d.height)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ZoneLayer({ silhouette, zone, active }: { silhouette: Silhouette; zone: PrintZone; active: boolean }) {
  const spec = SILHOUETTES[silhouette].zones[zone];
  const designs = useCustomizer((s) => s.designs[zone]);
  const color = useCustomizer((s) => s.color);
  const selectedId = useCustomizer((s) => s.selectedId);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState({ v: false, h: false });
  const upload = useArtworkUpload(zone);

  return (
    <div ref={zoneRef} className={cn("absolute", active ? "z-10" : "z-0")} style={zoneBoxStyle(silhouette, zone)}>
      {active && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 border border-dashed border-bone/35" style={{ borderWidth: "calc(1px * var(--inv-zoom, 1))" }} />
          {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((c) => (
            <span key={c} className={cn("absolute h-[14%] max-h-5 w-[14%] max-w-5 border-volt", c)} />
          ))}
          <div className="absolute bottom-full left-0 mb-1 origin-bottom-left whitespace-nowrap" style={counterScale}>
            <span className="label text-[9px]! text-volt">
              Printable area · {spec.widthIn}&quot; × {spec.heightIn}&quot;
            </span>
          </div>
          {guides.v && <span className="absolute inset-y-0 left-1/2 w-px bg-volt/80" />}
          {guides.h && <span className="absolute inset-x-0 top-1/2 h-px bg-volt/80" />}
        </div>
      )}
      <div className="absolute inset-0">
        {designs.map((d) => (
          <DesignItem key={d.id} d={d} spec={spec} zoneRef={zoneRef} active={active} selected={d.id === selectedId} onGuides={setGuides} />
        ))}
        <PrintShading silhouette={silhouette} color={color} zone={zone} designs={designs} />
      </div>
      {active && designs.length === 0 && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={upload.open}
          className="group absolute inset-[6%] flex flex-col items-center justify-center gap-2 text-bone/50 transition-colors hover:bg-volt/5 hover:text-volt"
        >
          <span style={counterScale} className="flex flex-col items-center gap-1.5">
            <ImagePlus size={spec.widthIn < 4 ? 14 : 22} strokeWidth={1.5} />
            {spec.widthIn >= 4 && <span className="label text-[9px]!">{upload.busy ? "Loading…" : "Upload artwork"}</span>}
          </span>
        </button>
      )}
      <input {...upload.inputProps} />
    </div>
  );
}
