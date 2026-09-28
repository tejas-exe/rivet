"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Heart, Plus, Ruler, ShieldCheck, Truck, Wand2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GarmentImage } from "@/components/garment/GarmentImage";
import { Button } from "@/components/ui/Button";
import { Container, SectionHeader, Stars } from "@/components/ui/misc";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Barcode, CornerFrame, RoughCircle, StreetTag, TechnicalDivider } from "@/components/ui/street";
import { COLORS } from "@/data/colors";
import { CATEGORY_META, relatedProducts } from "@/data/products";
import { RATING_BREAKDOWN, REVIEWS, SIZE_GUIDE, type Review } from "@/data/reviews";
import { formatDate, formatINR } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from "@/lib/pricing";
import type { ColorId, GarmentView, Product, Size } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import { ProductCard } from "./ProductCard";
import { useShopActions } from "./useShopActions";

const VIEW_LABEL: Record<GarmentView, string> = { front: "Front", back: "Back", detail: "Collar detail", leftSleeve: "Sleeve", rightSleeve: "Sleeve" };

/** Cinematic product stage: garage lighting, wet floor grid, HUD read-outs. */
function Gallery({ product, color }: { product: Product; color: ColorId }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const view = product.images[active];
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      <div className="no-scrollbar flex gap-2 overflow-x-auto md:w-24 md:flex-col">
        {product.images.map((v, i) => (
          <button
            key={v + i}
            onClick={() => setActive(i)}
            aria-label={`Show ${VIEW_LABEL[v]}`}
            className={cn(
              "group relative aspect-square w-20 shrink-0 bg-char/50 transition-all md:w-full",
              i === active ? "ring-1 ring-volt shadow-[0_0_14px_rgb(255_46_147/0.35)]" : "ring-1 ring-line hover:ring-line-strong",
            )}
          >
            <GarmentImage silhouette={product.silhouette} color={color} view={v} rich={false} className="h-full w-full p-1.5 transition-transform duration-200 group-hover:scale-105" />
            <span className={cn("label absolute top-1 left-1 text-[8px]!", i === active ? "text-volt" : "text-fog")}>Cam {String(i + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
      <div
        className="relative isolate aspect-square flex-1 cursor-zoom-in overflow-hidden md:aspect-[5/5.4]"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onPointerLeave={() => setZoom(null)}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-char/70 via-coal/40 to-ink/0" />
        <div className="garage-light absolute inset-0 -z-10" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[38%] overflow-hidden opacity-60">
          <div className="floor-grid absolute inset-x-[-20%] top-0 h-[200%]" />
        </div>
        <p aria-hidden className="display text-outline pointer-events-none absolute top-[6%] left-1/2 -z-10 -translate-x-1/2 text-[clamp(6rem,16vw,15rem)] whitespace-nowrap">
          {product.buildName}
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={view + active}
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-[5%]"
          >
            <div
              className="h-full w-full transition-transform duration-200 ease-out"
              style={{ transform: zoom ? "scale(1.9)" : "scale(1)", transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%" }}
            >
              <GarmentImage silhouette={product.silhouette} color={color} view={view} className="h-full w-full" />
            </div>
          </motion.div>
        </AnimatePresence>
        <CornerFrame tone="cyan" size={16} className="m-3" />
        <div className="label pointer-events-none absolute top-5 left-6 space-y-1 text-fog">
          <p className="text-bone">RVT / {product.id.replace("p-", "")}</p>
          <p>{product.weight}</p>
        </div>
        <div className="label pointer-events-none absolute top-5 right-6 text-right text-fog">
          <p>{COLORS[color].name}</p>
          <p className="text-cyan">Studio lit</p>
        </div>
        <div className="label pointer-events-none absolute bottom-5 left-6 flex items-center gap-3 text-fog">
          <span className="text-volt">{String(active + 1).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-line-strong" />
          {String(product.images.length).padStart(2, "0")} — {VIEW_LABEL[view]}
        </div>
        <Barcode className="pointer-events-none absolute right-6 bottom-5" />
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen(!open)} className="label flex w-full items-center justify-between py-4 text-bone" aria-expanded={open}>
        {title}
        <ChevronDown size={14} className={cn("transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="pb-5 text-sm leading-relaxed text-mute">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SizeGuideTable({ product }: { product: Product }) {
  const g = SIZE_GUIDE[product.category];
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs sm:text-sm">
          <thead>
            <tr>
              {g.headers.map((h) => (
                <th key={h} className="label border-b border-line-strong py-3 text-left font-normal text-fog">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {g.rows.map((r) => (
              <tr key={r[0]} className="hover:bg-char">
                {r.map((c, i) => (
                  <td key={i} className={cn("border-b border-line py-3", i === 0 && "font-bold text-volt")}>
                    {c}
                    {i > 0 && <span className="text-fog">"</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-mute">{g.note}</p>
    </div>
  );
}

function Reviews({ product }: { product: Product }) {
  const [extra, setExtra] = useState<Review[]>([]);
  const [writing, setWriting] = useState(false);
  const [form, setForm] = useState({ author: "", title: "", body: "", rating: 5 });
  const notify = useUI((s) => s.notify);
  const all = [...extra, ...REVIEWS];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.body.trim()) return notify("Add your name and a review");
    setExtra([
      { id: `local-${Date.now()}`, author: form.author, city: "India", rating: form.rating, title: form.title || "Review", body: form.body, size: "M", date: new Date().toISOString(), verified: false, customBuild: false },
      ...extra,
    ]);
    setForm({ author: "", title: "", body: "", rating: 5 });
    setWriting(false);
    notify("Thanks — review posted");
  };

  return (
    <div id="reviews" className="grid gap-12 lg:grid-cols-[320px_1fr]">
      <div>
        <p className="display text-9xl text-volt neon-text">{product.rating.toFixed(1)}</p>
        <Stars rating={product.rating} size={16} className="mt-2" />
        <p className="label mt-3 text-mute">{product.reviews.toLocaleString("en-IN")} reviews</p>
        <div className="mt-8 space-y-2">
          {RATING_BREAKDOWN.map((r) => (
            <div key={r.stars} className="flex items-center gap-3 font-mono text-xs text-mute">
              <span className="w-3">{r.stars}</span>
              <div className="h-1 flex-1 bg-steel">
                <motion.div className="h-full bg-volt" initial={{ width: 0 }} whileInView={{ width: `${r.share * 100}%` }} viewport={{ once: true }} transition={{ duration: 1 }} />
              </div>
              <span className="w-8 text-right">{Math.round(r.share * 100)}%</span>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="mt-8" block onClick={() => setWriting(!writing)}>
          {writing ? "Cancel" : "Write a review"}
        </Button>
      </div>
      <div>
        <AnimatePresence>
          {writing && (
            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={submit} className="mb-8 overflow-hidden">
              <div className="grid gap-3 border border-line p-5 sm:grid-cols-2">
                <div className="flex items-center gap-1 sm:col-span-2" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} stars`} className={cn("h-8 w-8 font-mono text-sm", n <= form.rating ? "bg-volt text-ink" : "bg-char text-mute")}>
                      {n}
                    </button>
                  ))}
                </div>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Your name" className="border border-line bg-transparent px-3 py-3 text-sm focus:border-volt focus:outline-none" />
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Headline" className="border border-line bg-transparent px-3 py-3 text-sm focus:border-volt focus:outline-none" />
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="How does it fit? How's the print?" rows={3} className="border border-line bg-transparent px-3 py-3 text-sm focus:border-volt focus:outline-none sm:col-span-2" />
                <Button type="submit" className="sm:col-span-2">Post review</Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        <div className="divide-y divide-line border-y border-line">
          {all.map((r) => (
            <article key={r.id} className="grid gap-4 py-7 md:grid-cols-[180px_1fr]">
              <div>
                <p className="font-wide text-sm font-bold uppercase">{r.author}</p>
                <p className="label mt-1 text-fog">{r.city}</p>
                {r.verified && <p className="label mt-3 text-volt">✓ Verified buyer</p>}
                {r.customBuild && <p className="label mt-1 text-bone-dim">Custom build</p>}
              </div>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <Stars rating={r.rating} />
                  <span className="label text-fog">{formatDate(r.date)}</span>
                </div>
                <p className="mt-3 font-wide font-bold uppercase">{r.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-mute">{r.body}</p>
                <p className="label mt-3 text-fog">Size bought: {r.size}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductDetail({ product, initialColor }: { product: Product; initialColor?: ColorId }) {
  const router = useRouter();
  const [color, setColor] = useState<ColorId>(initialColor && product.colors.includes(initialColor) ? initialColor : product.colors[0]);
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [guide, setGuide] = useState(false);
  const hydrated = useUI((s) => s.hydrated);
  const wished = useWishlist((s) => s.slugs.includes(product.slug));
  const { addToCart, toggleWishlist } = useShopActions();

  const requireSize = () => {
    if (size) return size;
    setSizeError(true);
    setTimeout(() => setSizeError(false), 1600);
    return null;
  };

  const add = () => {
    const s = requireSize();
    if (s) addToCart(product, color, s, qty);
  };
  const buyNow = () => {
    const s = requireSize();
    if (!s) return;
    addToCart(product, color, s, qty, false);
    router.push("/checkout");
  };
  const customize = () => router.push(`/customize/${product.slug}?color=${color}${size ? `&size=${size}` : ""}`);

  return (
    <>
      <Container className="pt-28 md:pt-32">
        <nav className="label mb-6 flex flex-wrap gap-2 text-fog" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-bone">Home</Link> /
          <Link href={`/shop/${CATEGORY_META[product.category].slug}`} className="hover:text-bone">
            {CATEGORY_META[product.category].plural}
          </Link>
          / <span className="text-volt">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Gallery product={product} color={color} />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="label mb-4 flex items-center gap-3 text-mute">
                  <span className="h-1.5 w-1.5 bg-volt shadow-[0_0_8px_rgb(255_46_147/0.9)]" />
                  {CATEGORY_META[product.category].label} <span className="text-fog">/ Street series</span>
                  {product.isNew && <StreetTag tone="acid">New</StreetTag>}
                </p>
                <h1 className="display text-[clamp(3.2rem,7vw,6.2rem)]">
                  {product.name.split(" ").map((w, i, arr) => (
                    <span key={i} className={cn("block", i === arr.length - 1 && arr.length > 1 && "text-outline-bone not-italic")}>
                      {w}
                    </span>
                  ))}
                </h1>
              </div>
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="clip-angle-sm mt-1 grid h-12 w-12 shrink-0 place-items-center bg-steel/60 transition-colors hover:bg-volt/20"
              >
                <Heart size={19} className={cn(hydrated && wished && "fill-volt text-volt drop-shadow-[0_0_6px_rgb(255_46_147/0.9)]")} />
              </button>
            </div>
            <a href="#reviews" className="mt-5 inline-flex items-center gap-3 text-sm text-mute hover:text-bone">
              <Stars rating={product.rating} /> {product.rating.toFixed(1)} · {product.reviews.toLocaleString("en-IN")} reviews
            </a>
            <div className="mt-6 flex items-end gap-4">
              <span className="display neon-text text-7xl text-volt md:text-8xl">{formatINR(product.basePrice)}</span>
              <div className="pb-2">
                {product.compareAtPrice && <p className="font-mono text-fog line-through">{formatINR(product.compareAtPrice)}</p>}
                <p className="label text-fog">Base / Incl. all taxes</p>
              </div>
            </div>
            <p className="mt-6 max-w-lg leading-relaxed text-bone-dim">
              {product.tagline} {product.description.split(".")[0]}.
            </p>

            {/* Paint selector */}
            <div className="mt-8">
              <TechnicalDivider label="01 / Paint" meta={`${String(product.colors.indexOf(color) + 1).padStart(2, "0")} — ${COLORS[color].name}`} className="mb-4" />
              <div className="flex gap-3" role="radiogroup" aria-label="Color">
                {product.colors.map((c, i) => {
                  const on = c === color;
                  return (
                    <button
                      key={c}
                      role="radio"
                      aria-checked={on}
                      aria-label={COLORS[c].name}
                      onClick={() => setColor(c)}
                      className="group relative flex flex-col items-start gap-2"
                    >
                      <span
                        className={cn(
                          "block h-14 w-20 -skew-x-12 transition-transform duration-200 group-hover:scale-110",
                          on ? "ring-2 ring-volt ring-offset-2 ring-offset-ink shadow-[0_0_18px_rgb(255_46_147/0.55)]" : "ring-1 ring-white/15",
                        )}
                        style={{ background: `linear-gradient(135deg, rgb(255 255 255 / 0.25), transparent 45%), ${COLORS[c].swatch}` }}
                      />
                      {on && <RoughCircle key={c} className="-top-3 -left-4 h-[90px] w-[112px]" width={2} />}
                      <span className={cn("label text-[9.5px]!", on ? "text-bone" : "text-fog")}>
                        {String(i + 1).padStart(2, "0")} {COLORS[c].name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size selector */}
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-4">
                <p className={cn("label shrink-0 transition-colors", sizeError ? "text-alert" : "text-fog")}>
                  {sizeError ? "Select a size to continue" : <>02 / Size {size && <span className="text-bone">— {size}</span>}</>}
                </p>
                <span className="h-px flex-1 bg-line-strong" />
                <button onClick={() => setGuide(true)} className="label flex shrink-0 items-center gap-1.5 text-cyan hover:text-bone">
                  <Ruler size={13} /> Size guide
                </button>
              </div>
              <motion.div className="grid grid-cols-5 gap-1.5" animate={sizeError ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
                {(["S", "M", "L", "XL", "XXL"] as Size[]).map((s) => {
                  const available = product.sizes.includes(s);
                  return (
                    <button
                      key={s}
                      disabled={!available}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={cn(
                        "clip-angle-sm relative h-14 font-wide text-lg font-extrabold italic transition-colors duration-150",
                        size === s ? "bg-volt text-ink" : "bg-steel/60 text-bone-dim hover:bg-line-strong hover:text-bone",
                        !available && "text-fog line-through opacity-50",
                        sizeError && !size && "bg-alert/20",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </motion.div>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <p className="label text-fog">03 / Qty</p>
              <QuantityStepper value={qty} onChange={setQty} />
            </div>

            <div className="mt-9 grid gap-2">
              <div className="relative">
                <StreetTag tone="cyan" rotate={3} className="absolute -top-3 right-3 z-10">
                  Build mode
                </StreetTag>
                <Button size="xl" onClick={customize} block iconLeft={<Wand2 size={17} />} icon={<ArrowRight size={17} />}>
                  Customize this
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button size="lg" variant="bone" onClick={add} icon={<Plus size={15} strokeWidth={3} />}>
                  Add to cart — {formatINR(product.basePrice * qty)}
                </Button>
                <Button size="lg" variant="ghost" onClick={buyNow} icon={<ArrowRight size={15} />}>
                  Buy now
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 border-y border-line text-xs">
              <div className="flex items-center gap-3 py-3 pr-3">
                <Truck size={16} className="shrink-0 text-cyan" />
                <span className="text-mute">Free shipping over {formatINR(FREE_SHIPPING_THRESHOLD)}</span>
              </div>
              <div className="flex items-center gap-3 border-l border-line py-3 pl-3">
                <ShieldCheck size={16} className="shrink-0 text-cyan" />
                <span className="text-mute">7-day size exchanges</span>
              </div>
            </div>

            <div className="mt-6 border-t border-line">
              <Accordion title="Material" defaultOpen>
                {product.material}. Weight: {product.weight}.
                <ul className="mt-3 grid grid-cols-2 gap-2">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-bone-dim">
                      <span className="h-1 w-1 bg-volt" /> {h}
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title="Fit">{product.fit}. Model is 6'0" and wears size L.</Accordion>
              <Accordion title="Care instructions">
                <ul className="space-y-1.5">
                  {product.care.map((c) => (
                    <li key={c}>— {c}</li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title="Shipping information">
                Standard delivery ({formatINR(SHIPPING_RATES.standard)}, free over {formatINR(FREE_SHIPPING_THRESHOLD)}) arrives in 5–7 business days. Express delivery ({formatINR(SHIPPING_RATES.express)}) in 2–3 business days. Custom builds are printed to order and ship within 48 hours of confirmation.
              </Accordion>
            </div>
          </div>
        </div>
      </Container>

      <section className="relative mt-24 border-t border-line py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionHeader index="04" eyebrow="Product description" title={<>The <em>details</em></>} />
            <p className="mt-8 max-w-xl leading-relaxed text-bone-dim">{product.description}</p>
            <dl className="mt-8 grid max-w-xl grid-cols-2 border-t border-line">
              {[
                ["Fabric", product.material.split(",")[0]],
                ["Weight", product.weight],
                ["Fit", product.fit.split(" —")[0]],
                ["Printable", product.category === "hoodie" ? "Front · Back · Sleeves" : "Front · Back · Sleeves"],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-line py-4 pr-4">
                  <dt className="label text-fog">{k}</dt>
                  <dd className="mt-1 text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div id="size-guide" className="min-w-0">
            <SectionHeader index="05" eyebrow="Measurements" title={<>Size <em>guide</em></>} />
            <div className="mt-8">
              <SizeGuideTable product={product} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-20">
        <Container>
          <SectionHeader index="06" eyebrow="What builders say" title={<>Re<em>views</em></>} className="mb-12" />
          <Reviews product={product} />
        </Container>
      </section>

      <section className="border-t border-line py-20">
        <Container>
          <SectionHeader index="07" eyebrow="Keep building" title={<>You may<br /><em>also like</em></>} />
          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-x-4 gap-y-10">
            {relatedProducts(product).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* Spacer so the sticky buy bar never covers the footer on small screens */}
      <div className="h-20 lg:hidden" aria-hidden />

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line-strong bg-ink/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt/70 to-transparent" />
        <div className="min-w-0 flex-1">
          <p className="display truncate text-xl">{product.name}</p>
          <p className="font-mono text-[11px] text-mute">
            <span className="text-volt">{formatINR(product.basePrice)}</span> · {COLORS[color].name} {size ? `· ${size}` : ""}
          </p>
        </div>
        <Button onClick={add} size="md" variant="ghost" className="px-4" aria-label="Add to cart">
          <Plus size={16} strokeWidth={3} />
        </Button>
        <Button onClick={customize} size="md" iconLeft={<Wand2 size={14} />}>
          Build
        </Button>
      </div>

      <AnimatePresence>
        {guide && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Size guide">
            <motion.div className="absolute inset-0 bg-black/75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGuide(false)} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-xl border-t-2 border-volt bg-coal p-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="display text-3xl">Size guide</p>
                <button onClick={() => setGuide(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <SizeGuideTable product={product} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
