"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Crosshair, ImagePlus, Layers, Trash2, Upload } from "lucide-react";
import { COLORS, COLOR_ORDER, SIZES } from "@/data/colors";
import { PRESET_GRAPHICS } from "@/data/graphics";
import { CATEGORY_META, getProduct, PRODUCTS } from "@/data/products";
import { SIZE_GUIDE } from "@/data/reviews";
import { designArea, summarizeZone } from "@/lib/pricing";
import { formatArea, formatINR, formatInches } from "@/lib/format";
import { getZone, ZONE_LABELS, ZONE_ORDER } from "@/lib/garment";
import { sound } from "@/lib/sound";
import type { Category, Design, PrintZone } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isZonePanel, useCustomizer, zoneInches } from "@/store/customizer";
import { useStudioUI } from "@/store/studio";
import { GarmentImage } from "@/components/garment/GarmentImage";
import { RoughCircle } from "@/components/ui/street";
import { useArtworkUpload } from "./useArtworkUpload";

function PanelTitle({ title, value, kicker }: { title: string; value?: string; kicker?: string }) {
  return (
    <div className="mb-4">
      {kicker && <p className="label mb-1 text-[9px]! text-cyan">{kicker}</p>}
      <div className="flex items-baseline gap-3">
        <p className="display text-3xl">{title}</p>
        <span className="h-px w-6 self-center bg-volt" />
        <AnimatePresence mode="wait">
          <motion.p
            key={value}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.16 }}
            className="display text-3xl text-volt neon-text"
          >
            {value}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────── PRODUCT ───────────────
export function ProductSelector() {
  const slug = useCustomizer((s) => s.productSlug);
  const setProduct = useCustomizer((s) => s.setProduct);
  const color = useCustomizer((s) => s.color);
  const current = getProduct(slug)!;
  return (
    <div>
      <PanelTitle kicker="01 / Select base" title="Product" value={current.buildName} />
      {(["tshirt", "hoodie"] as Category[]).map((cat) => (
        <div key={cat} className="mb-3">
          <p className="label mb-2 text-fog">{CATEGORY_META[cat].plural}</p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {PRODUCTS.filter((p) => p.category === cat).map((p) => {
              const active = p.slug === slug;
              return (
                <button
                  key={p.slug}
                  onClick={() => {
                    if (active) return;
                    sound.play("whoosh");
                    setProduct(p.slug);
                  }}
                  onMouseEnter={() => sound.play("hover")}
                  className={cn(
                    "group relative flex w-[132px] shrink-0 flex-col border-l-2 p-2 text-left transition-colors",
                    active ? "border-volt bg-volt/[0.08]" : "border-line-strong bg-char/50 hover:border-bone hover:bg-char",
                  )}
                >
                  <GarmentImage silhouette={p.silhouette} color={p.colors.includes(color) ? color : p.colors[0]} rich={false} className="mx-auto h-14 w-14 transition-transform duration-200 group-hover:scale-110" />
                  <span className="mt-1 truncate font-wide text-[12px] font-extrabold uppercase italic">{p.buildName}</span>
                  <span className={cn("font-mono text-[11px]", active ? "text-volt" : "text-mute")}>{formatINR(p.basePrice)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────── COLOR ───────────────
export function ColorSelector() {
  const color = useCustomizer((s) => s.color);
  const setColor = useCustomizer((s) => s.setColor);
  const product = getProduct(useCustomizer((s) => s.productSlug))!;
  return (
    <div>
      <PanelTitle kicker={`02 / Paint / ${String(COLOR_ORDER.indexOf(color) + 1).padStart(2, "0")}`} title="Paint" value={COLORS[color].name} />
      <div className="flex flex-wrap gap-5 md:gap-7" role="radiogroup" aria-label="Garment color">
        {COLOR_ORDER.map((c, i) => {
          const available = product.colors.includes(c);
          const active = c === color;
          return (
            <button
              key={c}
              role="radio"
              aria-checked={active}
              disabled={!available}
              onClick={() => {
                sound.play("select");
                setColor(c);
              }}
              onMouseEnter={() => available && sound.play("hover")}
              className="group flex flex-col items-start gap-2 disabled:opacity-25"
            >
              <span className="relative grid h-16 w-24 place-items-center md:h-[72px] md:w-28">
                {/* neon ring */}
                <span className="absolute inset-0 -skew-x-12">
                  <motion.span
                    className="absolute inset-0"
                    animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.9 }}
                    transition={{ duration: 0.2 }}
                    style={{ boxShadow: "0 0 0 2px #ff2e93, 0 0 18px rgb(255 46 147 / 0.6), inset 0 0 12px rgb(255 46 147 / 0.3)" }}
                  />
                </span>
                {active && <RoughCircle key={c} tone="cyan" className="-top-[18%] -left-[14%] h-[136%] w-[128%]" width={2} />}
                <span
                  className="h-[78%] w-[84%] -skew-x-12 ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `linear-gradient(125deg, rgba(255,255,255,0.32), transparent 40%), linear-gradient(to top, rgba(0,0,0,0.35), transparent 60%), ${COLORS[c].swatch}` }}
                />
              </span>
              <span className={cn("label text-[9.5px]!", active ? "text-bone" : "text-mute")}>
                <span className={active ? "text-volt" : "text-fog"}>{String(i + 1).padStart(2, "0")}</span> {COLORS[c].name}
              </span>
            </button>
          );
        })}
      </div>
      {product.colors.length < COLOR_ORDER.length && <p className="label mt-3 text-fog">Some colours aren&apos;t offered on this blank.</p>}
    </div>
  );
}

// ─────────────── SIZE ───────────────
export function SizeSelector() {
  const size = useCustomizer((s) => s.size);
  const setSize = useCustomizer((s) => s.setSize);
  const product = getProduct(useCustomizer((s) => s.productSlug))!;
  const row = SIZE_GUIDE[product.category].rows.find((r) => r[0] === size);
  return (
    <div>
      <PanelTitle kicker="03 / Fitment" title="Size" value={size} />
      <div className="flex gap-2">
        {SIZES.map((s) => {
          const available = product.sizes.includes(s);
          const active = s === size;
          return (
            <button
              key={s}
              disabled={!available}
              onClick={() => {
                sound.play("select");
                setSize(s);
              }}
              onMouseEnter={() => available && sound.play("hover")}
              className={cn(
                "clip-angle-sm relative h-14 w-14 font-wide text-lg font-extrabold italic transition-all duration-150 md:h-16 md:w-16 md:text-xl",
                active ? "bg-volt text-ink" : "bg-steel text-bone-dim hover:-translate-y-0.5 hover:bg-line-strong hover:text-bone",
                !available && "line-through opacity-30",
              )}
            >
              {s}
            </button>
          );
        })}
      </div>
      {row && (
        <p className="mt-4 font-mono text-[11px] text-mute">
          Chest {row[1]}" · Length {row[2]}" · Shoulder {row[3]}" — {product.fit}
        </p>
      )}
    </div>
  );
}

// ─────────────── Selected artwork controls ───────────────
function Readout({ label, value, glow }: { label: string; value: string; glow?: boolean }) {
  return (
    <div className="border-l border-line-strong pl-3">
      <p className="label text-[9px]! text-fog">{label}</p>
      <p className={cn("display text-3xl tabular-nums transition-colors md:text-4xl", glow ? "text-cyan neon-text-cyan" : "text-bone")}>{value}</p>
      {/* measurement ticks */}
      <span aria-hidden className="mt-1 flex h-1.5 items-end gap-[3px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={cn("w-px", i % 5 === 0 ? "h-1.5 bg-bone/50" : "h-1 bg-bone/25")} />
        ))}
      </span>
    </div>
  );
}

function ArtworkControls({ design }: { design: Design }) {
  const update = useCustomizer((s) => s.updateDesign);
  const remove = useCustomizer((s) => s.removeDesign);
  const duplicate = useCustomizer((s) => s.duplicateDesign);
  const center = useCustomizer((s) => s.centerDesign);
  const interaction = useStudioUI((s) => s.interaction);
  const product = getProduct(useCustomizer((s) => s.productSlug))!;
  const zone = zoneInches(product.silhouette, design.zone);
  const aspect = design.width / design.height;
  const maxW = Math.min(zone.w, zone.h * aspect);
  const scaleFill = ((design.width - 1) / Math.max(0.01, maxW - 1)) * 100;
  const rotFill = ((design.rotation + 180) / 360) * 100;

  const btn = "clip-angle-sm label flex h-9 items-center gap-1.5 bg-steel/70 px-3 text-bone-dim transition-colors hover:bg-bone hover:text-ink";
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        <Readout label="Width" value={formatInches(design.width)} glow={interaction === "resize"} />
        <Readout label="Height" value={formatInches(design.height)} glow={interaction === "resize"} />
        <Readout label="Area" value={formatArea(designArea(design))} glow={interaction === "resize"} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label flex justify-between text-[9px]! text-fog">
            Scale <span className="text-bone-dim">{formatInches(design.width)} W</span>
          </span>
          <input
            type="range"
            className="hud-range"
            min={1}
            max={maxW}
            step={0.1}
            value={design.width}
            style={{ ["--fill" as string]: `${scaleFill}%` }}
            onChange={(e) => {
              const w = +e.target.value;
              update(design.id, { width: w, height: w / aspect });
            }}
            aria-label="Artwork width"
          />
        </label>
        <label className="block">
          <span className="label flex justify-between text-[9px]! text-fog">
            Rotate <span className="text-bone-dim">{Math.round(design.rotation)}°</span>
          </span>
          <input
            type="range"
            className="hud-range"
            min={-180}
            max={180}
            step={1}
            value={design.rotation}
            style={{ ["--fill" as string]: `${rotFill}%` }}
            onChange={(e) => update(design.id, { rotation: +e.target.value })}
            aria-label="Artwork rotation"
          />
        </label>
        <div className="flex flex-wrap gap-1.5 sm:col-span-2">
          <button className={btn} onClick={() => { sound.play("select"); center(design.id); }}>
            <Crosshair size={13} /> Center
          </button>
          <button className={btn} onClick={() => { sound.play("select"); update(design.id, { rotation: 0 }); }}>
            0°
          </button>
          <button className={btn} onClick={() => { sound.play("drop"); duplicate(design.id); }}>
            <Copy size={13} /> Duplicate
          </button>
          <button className={cn(btn, "hover:bg-alert hover:text-ink")} onClick={() => { sound.play("tick"); remove(design.id); }}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────── PRINT LOCATION ───────────────
export function PrintZoneSelector({ zone }: { zone: PrintZone }) {
  const product = getProduct(useCustomizer((s) => s.productSlug))!;
  const designs = useCustomizer((s) => s.designs[zone]);
  const selectedId = useCustomizer((s) => s.selectedId);
  const select = useCustomizer((s) => s.select);
  const clearZone = useCustomizer((s) => s.clearZone);
  const upload = useArtworkUpload(zone);
  const spec = getZone(product.silhouette, zone);
  const summary = summarizeZone(zone, designs);
  const selected = designs.find((d) => d.id === selectedId);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <PanelTitle kicker={`Print zone / ${ZONE_LABELS[zone]} / ${String(ZONE_ORDER.indexOf(zone) + 1).padStart(2, "0")}`} title={ZONE_LABELS[zone]} value={`${spec.widthIn}" × ${spec.heightIn}"`} />
        <p className="label mt-1.5 text-fog">
          {summary ? (
            <>
              {summary.area.toFixed(2)} in² · {summary.units} units · <span className="text-cyan">{formatINR(summary.price)}</span>
            </>
          ) : (
            "No print · ₹0"
          )}
        </p>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex shrink-0 gap-1.5">
          {designs.map((d) => (
            <button
              key={d.id}
              onClick={() => select(d.id)}
              aria-label={`Select ${d.name}`}
              className={cn("block h-14 w-14 shrink-0 overflow-hidden border bg-char p-1.5 transition-colors", d.id === selectedId ? "border-cyan shadow-[0_0_10px_rgb(34_234_255/0.4)]" : "border-line hover:border-line-strong")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.src} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
          <button onClick={upload.open} className="flex h-14 w-14 flex-col items-center justify-center gap-1 border border-dashed border-line-strong text-mute transition-colors hover:border-cyan hover:text-cyan" aria-label="Upload artwork">
            <ImagePlus size={16} />
            <span className="label text-[8px]!">{upload.busy ? "…" : "Upload"}</span>
          </button>
          <input {...upload.inputProps} />
        </div>
        <div className="min-w-0 flex-1">
          {selected ? (
            <ArtworkControls design={selected} />
          ) : designs.length ? (
            <p className="text-sm text-mute">Select a graphic to move, resize or rotate it. <button className="label ml-2 text-fog hover:text-alert" onClick={() => clearZone(zone)}>Clear zone</button></p>
          ) : (
            <p className="text-sm text-mute">
              Upload PNG, JPG, JPEG or WEBP — or pick a starter graphic in <span className="text-bone">Design</span>. Printing: ₹50 per 10 in².
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────── DESIGN (library + layers) ───────────────
export function DesignUploader() {
  const activeZone = useCustomizer((s) => s.activeZone);
  const setActiveZone = useCustomizer((s) => s.setActiveZone);
  const addDesign = useCustomizer((s) => s.addDesign);
  const setPanel = useCustomizer((s) => s.setPanel);
  const designs = useCustomizer((s) => s.designs);
  const selectedId = useCustomizer((s) => s.selectedId);
  const select = useCustomizer((s) => s.select);
  const upload = useArtworkUpload(activeZone);
  const all = ZONE_ORDER.flatMap((z) => designs[z]);

  return (
    <div>
      <PanelTitle kicker="06 / Graphics" title="Design" value={`to ${ZONE_LABELS[activeZone]}`} />
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="label mr-1 text-fog">Target</span>
        {ZONE_ORDER.map((z) => (
          <button key={z} onClick={() => { sound.play("select"); setActiveZone(z); }} className={cn("clip-angle-sm label px-2.5 py-1.5 transition-colors", z === activeZone ? "bg-volt text-ink" : "bg-steel/60 text-mute hover:text-bone")}>
            {ZONE_LABELS[z]}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <button
          onClick={upload.open}
          className="group flex h-20 items-center gap-3 border border-dashed border-cyan/40 px-5 text-left transition-colors hover:border-cyan hover:bg-cyan/5 lg:w-56"
        >
          <Upload size={20} className="text-cyan transition-transform duration-200 group-hover:-translate-y-0.5" />
          <span>
            <span className="block font-wide text-sm font-extrabold uppercase italic">{upload.busy ? "Processing…" : "Upload artwork"}</span>
            <span className="label text-[9px]! text-fog">PNG · JPG · JPEG · WEBP</span>
          </span>
        </button>
        <input {...upload.inputProps} />
        <div className="min-w-0">
          <p className="label mb-2 text-fog">Starter graphics</p>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
            {PRESET_GRAPHICS.map((g) => (
              <button
                key={g.id}
                title={g.name}
                onClick={() => {
                  sound.play("drop");
                  addDesign({ src: g.src, name: g.name, aspect: g.aspect }, activeZone);
                  setPanel(activeZone);
                }}
                onMouseEnter={() => sound.play("hover")}
                className="block h-16 w-16 shrink-0 overflow-hidden border border-line bg-char p-2 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-volt"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.name} className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      </div>
      {all.length > 0 && (
        <div className="mt-4">
          <p className="label mb-2 flex items-center gap-2 text-fog"><Layers size={12} /> Layers</p>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {all.map((d) => (
              <button
                key={d.id}
                onClick={() => { select(d.id); setPanel(d.zone); }}
                className={cn("flex shrink-0 items-center gap-2 border py-1 pr-3 pl-1", d.id === selectedId ? "border-cyan" : "border-line hover:border-line-strong")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.src} alt="" className="h-8 w-8 bg-char object-contain p-0.5" />
                <span className="text-left">
                  <span className="block max-w-[110px] truncate text-[11px] font-bold uppercase">{d.name}</span>
                  <span className="label text-[8.5px]! text-fog">{ZONE_LABELS[d.zone]}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ControlDeck() {
  const panel = useCustomizer((s) => s.panel);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={panel}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {panel === "product" && <ProductSelector />}
        {panel === "color" && <ColorSelector />}
        {panel === "size" && <SizeSelector />}
        {panel === "design" && <DesignUploader />}
        {isZonePanel(panel) && <PrintZoneSelector zone={panel} />}
      </motion.div>
    </AnimatePresence>
  );
}
