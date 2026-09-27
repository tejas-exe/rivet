"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Heart, Ruler, ShieldCheck, Truck, Wand2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GarmentImage } from "@/components/garment/GarmentImage";
import { Button } from "@/components/ui/Button";
import { Container, SectionHeader, Stars } from "@/components/ui/misc";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
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
            className={cn("relative aspect-square w-20 shrink-0 bg-char ring-1 transition-all md:w-full", i === active ? "ring-volt" : "ring-line hover:ring-line-strong")}
          >
            <GarmentImage silhouette={product.silhouette} color={color} view={v} rich={false} className="h-full w-full p-1.5" />
          </button>
        ))}
      </div>
      <div
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden bg-char md:aspect-[5/5.4]"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onPointerLeave={() => setZoom(null)}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(255,255,255,0.12),transparent_60%)]" />
        <AnimatePresence mode="wait">
          <motion.div
            key={view + active}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
        <div className="label pointer-events-none absolute bottom-4 left-4 flex items-center gap-3 text-fog">
          <span className="text-bone">{String(active + 1).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-line-strong" />
          {String(product.images.length).padStart(2, "0")} — {VIEW_LABEL[view]}
        </div>
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
        <table className="w-full min-w-[420px] border-collapse font-mono text-sm">
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
        <p className="font-wide text-7xl font-black">{product.rating.toFixed(1)}</p>
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
          / <span className="text-bone-dim">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Gallery product={product} color={color} />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label mb-3 flex items-center gap-2 text-mute">
                  {CATEGORY_META[product.category].label}
                  {product.isNew && <span className="bg-bone px-1.5 text-ink">New</span>}
                </p>
                <h1 className="display text-[clamp(2.4rem,5vw,4.2rem)]">{product.name}</h1>
              </div>
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="mt-1 grid h-12 w-12 shrink-0 place-items-center border border-line-strong hover:border-volt"
              >
                <Heart size={19} className={cn(hydrated && wished && "fill-volt text-volt")} />
              </button>
            </div>
            <a href="#reviews" className="mt-4 inline-flex items-center gap-3 text-sm text-mute hover:text-bone">
              <Stars rating={product.rating} /> {product.rating.toFixed(1)} · {product.reviews.toLocaleString("en-IN")} reviews
            </a>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-wide text-3xl font-black">{formatINR(product.basePrice)}</span>
              {product.compareAtPrice && <span className="font-mono text-fog line-through">{formatINR(product.compareAtPrice)}</span>}
              <span className="label text-fog">Incl. of all taxes</span>
            </div>
            <p className="mt-6 max-w-lg leading-relaxed text-bone-dim">{product.tagline} {product.description.split(".")[0]}.</p>

            <div className="mt-8 border-t border-line pt-6">
              <p className="label mb-3 text-mute">
                Color — <span className="text-bone">{COLORS[color].name}</span>
              </p>
              <div className="flex gap-2" role="radiogroup" aria-label="Color">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    role="radio"
                    aria-checked={c === color}
                    aria-label={COLORS[c].name}
                    onClick={() => setColor(c)}
                    className={cn("p-1 ring-1 transition-all", c === color ? "ring-volt" : "ring-line hover:ring-line-strong")}
                  >
                    <span className="block h-9 w-9" style={{ background: COLORS[c].swatch }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <p className={cn("label transition-colors", sizeError ? "text-alert" : "text-mute")}>
                  {sizeError ? "Select a size to continue" : <>Size {size && <>— <span className="text-bone">{size}</span></>}</>}
                </p>
                <button onClick={() => setGuide(true)} className="label flex items-center gap-1.5 text-bone-dim hover:text-volt">
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
                        "relative h-12 border font-mono text-sm transition-colors",
                        size === s ? "border-volt bg-volt text-ink" : "border-line-strong hover:border-bone",
                        !available && "text-fog line-through opacity-50 hover:border-line-strong",
                        sizeError && !size && "border-alert/60",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </motion.div>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <p className="label text-mute">Qty</p>
              <QuantityStepper value={qty} onChange={setQty} />
            </div>

            <div className="mt-8 grid gap-2">
              <Button size="lg" onClick={add} block>
                Add to cart — {formatINR(product.basePrice * qty)}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button size="lg" variant="ghost" onClick={customize} iconLeft={<Wand2 size={15} />}>
                  Customize this
                </Button>
                <Button size="lg" variant="bone" onClick={buyNow} icon={<ArrowRight size={15} />}>
                  Buy now
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-px bg-line text-xs">
              <div className="flex items-center gap-3 bg-ink py-3 pr-3">
                <Truck size={16} className="shrink-0 text-volt" />
                <span className="text-mute">Free shipping over {formatINR(FREE_SHIPPING_THRESHOLD)}</span>
              </div>
              <div className="flex items-center gap-3 bg-ink py-3 pl-3">
                <ShieldCheck size={16} className="shrink-0 text-volt" />
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

      <section className="mt-24 border-t border-line py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Product description" title="The details" />
            <p className="mt-8 max-w-xl leading-relaxed text-bone-dim">{product.description}</p>
            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-px bg-line">
              {[
                ["Fabric", product.material.split(",")[0]],
                ["Weight", product.weight],
                ["Fit", product.fit.split(" —")[0]],
                ["Printable", product.category === "hoodie" ? "Front · Back · Sleeves" : "Front · Back · Sleeves"],
              ].map(([k, v]) => (
                <div key={k} className="bg-ink py-4 pr-4">
                  <dt className="label text-fog">{k}</dt>
                  <dd className="mt-1 text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div id="size-guide">
            <SectionHeader eyebrow="Measurements" title="Size guide" />
            <div className="mt-8">
              <SizeGuideTable product={product} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-20">
        <Container>
          <SectionHeader eyebrow="What builders say" title="Reviews" className="mb-12" />
          <Reviews product={product} />
        </Container>
      </section>

      <section className="border-t border-line py-20">
        <Container>
          <SectionHeader eyebrow="Keep building" title="You may also like" />
          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-x-3 gap-y-10">
            {relatedProducts(product).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-ink/95 p-3 backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold uppercase">{product.name}</p>
          <p className="font-mono text-xs text-mute">
            {formatINR(product.basePrice)} · {COLORS[color].name} {size ? `· ${size}` : ""}
          </p>
        </div>
        <button onClick={customize} className="grid h-11 w-11 place-items-center border border-line-strong" aria-label="Customize this">
          <Wand2 size={16} />
        </button>
        <Button onClick={add} size="md">
          Add
        </Button>
      </div>

      <AnimatePresence>
        {guide && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Size guide">
            <motion.div className="absolute inset-0 bg-black/75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGuide(false)} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-xl border border-line-strong bg-coal p-6">
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
