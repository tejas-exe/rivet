"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/misc";
import { Barcode, NeonGlow, Scribble, ScrollDrift } from "@/components/ui/street";
import { COLORS, COLOR_ORDER, SIZES } from "@/data/colors";
import { CATEGORY_META, PRODUCTS } from "@/data/products";
import type { Category, ColorId, Product, Size } from "@/lib/types";
import { cn } from "@/lib/utils";

type SortId = "featured" | "price-asc" | "price-desc" | "newest";
const SORTS: { id: SortId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price Low to High" },
  { id: "price-desc", label: "Price High to Low" },
  { id: "newest", label: "Newest" },
];

function sortProducts(list: Product[], sort: SortId) {
  const out = [...list];
  if (sort === "price-asc") out.sort((a, b) => a.basePrice - b.basePrice);
  if (sort === "price-desc") out.sort((a, b) => b.basePrice - a.basePrice);
  if (sort === "newest") out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (sort === "featured") out.sort((a, b) => Number(b.featured) - Number(a.featured) || b.reviews - a.reviews);
  return out;
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function FilterGroup({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-line py-5">
      <button onClick={() => setOpen(!open)} className="label flex w-full items-center justify-between text-bone" aria-expanded={open}>
        <span className="flex items-center gap-2">
          <span className="text-volt">{n}</span> {title}
        </span>
        <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Filters {
  colors: ColorId[];
  sizes: Size[];
}

/** Game-style category selector: [ T-SHIRTS ] with a sliding neon indicator. */
function CategoryTabs({ category }: { category?: Category }) {
  const cats = [
    { href: "/shop", label: "All", active: !category },
    { href: "/shop/t-shirts", label: "T-Shirts", active: category === "tshirt" },
    { href: "/shop/hoodies", label: "Hoodies", active: category === "hoodie" },
    { href: "/customize", label: "Custom", active: false, accent: true },
  ];
  return (
    <nav className="no-scrollbar -mx-1 flex items-center overflow-x-auto" aria-label="Categories">
      {cats.map((c, i) => (
        <Link
          key={c.href}
          href={c.href}
          aria-current={c.active ? "page" : undefined}
          className={cn(
            "group relative flex shrink-0 items-center gap-1 px-3 py-2 font-wide text-[13px] font-extrabold tracking-[0.12em] uppercase italic transition-colors md:text-sm",
            c.active ? "text-bone" : c.accent ? "text-cyan hover:text-bone" : "text-mute hover:text-bone",
          )}
        >
          <span className={cn("font-mono not-italic transition-all duration-200", c.active ? "text-volt opacity-100" : "opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-60")}>[</span>
          <span className="font-mono text-[9px] not-italic text-fog">0{i + 1}</span>
          {c.label}
          <span className={cn("font-mono not-italic transition-all duration-200", c.active ? "text-volt opacity-100" : "opacity-0 translate-x-1 group-hover:translate-x-0 group-hover:opacity-60")}>]</span>
          {c.active && (
            <motion.span layoutId="shop-cat" className="absolute inset-x-3 -bottom-[13px] h-[2px] bg-volt shadow-[0_0_10px_rgb(255_46_147/0.9)]" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
          )}
        </Link>
      ))}
    </nav>
  );
}

function FilterPanel({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  return (
    <div>
      <FilterGroup n="01" title="Paint">
        <div className="grid grid-cols-2 gap-2">
          {COLOR_ORDER.map((c, i) => {
            const on = filters.colors.includes(c);
            return (
              <button
                key={c}
                onClick={() => setFilters({ ...filters, colors: toggle(filters.colors, c) })}
                aria-pressed={on}
                className={cn(
                  "group flex flex-col items-start gap-2 border-l-2 bg-char/40 px-2.5 py-2.5 text-left transition-colors",
                  on ? "border-volt bg-volt/[0.07] text-bone" : "border-line-strong text-bone-dim hover:border-bone",
                )}
              >
                <span
                  className={cn("h-6 w-full -skew-x-12 transition-transform duration-200 group-hover:scale-x-105", on && "shadow-[0_0_12px_rgb(255_46_147/0.5)]")}
                  style={{ background: COLORS[c].swatch, boxShadow: on ? undefined : "inset 0 0 0 1px rgb(255 255 255 / 0.15)" }}
                />
                <span className="label text-[9.5px]!">
                  <span className="text-fog">0{i + 1}</span> {COLORS[c].name}
                </span>
              </button>
            );
          })}
        </div>
      </FilterGroup>
      <FilterGroup n="02" title="Size">
        <div className="grid grid-cols-5 gap-1.5">
          {SIZES.map((s) => {
            const on = filters.sizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => setFilters({ ...filters, sizes: toggle(filters.sizes, s) })}
                aria-pressed={on}
                className={cn(
                  "clip-angle-sm h-10 font-wide text-xs font-extrabold italic transition-colors",
                  on ? "bg-volt text-ink" : "bg-steel/70 text-bone-dim hover:bg-line-strong hover:text-bone",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </div>
  );
}

export function ShopView({ category }: { category?: Category }) {
  const [filters, setFilters] = useState<Filters>({ colors: [], sizes: [] });
  const [sort, setSort] = useState<SortId>("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const base = useMemo(() => (category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS), [category]);
  const results = useMemo(() => {
    const list = base.filter(
      (p) =>
        (filters.colors.length === 0 || filters.colors.some((c) => p.colors.includes(c))) &&
        (filters.sizes.length === 0 || filters.sizes.some((s) => p.sizes.includes(s))),
    );
    return sortProducts(list, sort);
  }, [base, filters, sort]);

  const activeCount = filters.colors.length + filters.sizes.length;
  const clear = () => setFilters({ colors: [], sizes: [] });

  const chips = [
    ...filters.colors.map((c) => ({ key: `c-${c}`, label: COLORS[c].name, remove: () => setFilters({ ...filters, colors: toggle(filters.colors, c) }) })),
    ...filters.sizes.map((s) => ({ key: `s-${s}`, label: `Size ${s}`, remove: () => setFilters({ ...filters, sizes: toggle(filters.sizes, s) }) })),
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line pt-32 pb-10 md:pt-40">
        <div className="bg-blueprint pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <NeonGlow tone="pink" className="-top-32 -left-32 -z-10 h-[520px] w-[760px]" />
        <NeonGlow tone="cyan" className="top-10 right-[-10%] -z-10 h-[380px] w-[560px] opacity-70" />
        <ScrollDrift distance={120} className="pointer-events-none absolute right-0 bottom-0 -z-10 select-none">
          <p aria-hidden className="display text-outline text-[20vw] leading-[0.75] whitespace-nowrap">
            Drop 001
          </p>
        </ScrollDrift>
        <Container className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <nav className="label mb-6 flex gap-2 text-fog" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-bone">Home</Link> / <Link href="/shop" className="hover:text-bone">Shop</Link>
              {category && <> / <span className="text-volt">{CATEGORY_META[category].plural}</span></>}
            </nav>
            <h1 className="display text-[clamp(3.8rem,12vw,10rem)]">
              {category ? (
                <>
                  {CATEGORY_META[category].plural}
                  <span className="text-volt">.</span>
                </>
              ) : (
                <>
                  Shop
                  <br />
                  <span className="text-outline-bone not-italic pl-[0.5em]">the drop</span>
                  <span className="text-volt">.</span>
                </>
              )}
            </h1>
            <Scribble className="mt-3 h-3 w-48" />
            <p className="mt-5 max-w-lg text-mute">{category ? CATEGORY_META[category].blurb : "Every blank in the RIVET line-up. Wear it plain or send it to the studio."}</p>
          </div>
          <div className="flex items-end gap-5">
            <div className="text-right">
              <p className="display text-7xl leading-none md:text-8xl">{String(results.length).padStart(2, "0")}</p>
              <p className="label mt-2 text-mute">
                Pieces <span className="text-fog">/ Drop 001</span>
              </p>
            </div>
            <Barcode className="mb-1 hidden h-10 w-10 md:block" />
          </div>
        </Container>
      </section>

      <Container className="pt-4">
        <div className="sticky top-16 z-30 -mx-4 flex items-center justify-between gap-4 border-b border-line bg-ink/85 px-4 py-2.5 backdrop-blur-lg md:-mx-8 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <CategoryTabs category={category} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => setDrawer(true)} className="label flex items-center gap-2 border-l border-line px-3 py-2.5 hover:text-volt lg:hidden">
              <SlidersHorizontal size={14} /> <span className="hidden sm:inline">Filters</span> {activeCount > 0 && <span className="bg-volt px-1 text-ink">{activeCount}</span>}
            </button>
            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)} className="label flex items-center gap-2 border-l border-line py-2.5 pl-3 text-bone hover:text-volt" aria-haspopup="listbox" aria-expanded={sortOpen}>
                <span className="hidden text-fog sm:inline">Sort /</span> <span className="max-w-[90px] truncate sm:max-w-none">{SORTS.find((s) => s.id === sort)!.label}</span>
                <ChevronDown size={14} className={cn("transition-transform duration-200", sortOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.ul
                    role="listbox"
                    initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
                    animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
                    exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 z-40 mt-2 w-60 border-t-2 border-volt bg-coal/95 py-1 shadow-2xl backdrop-blur"
                  >
                    {SORTS.map((s, i) => (
                      <li key={s.id}>
                        <button
                          role="option"
                          aria-selected={s.id === sort}
                          onClick={() => {
                            setSort(s.id);
                            setSortOpen(false);
                          }}
                          className={cn("label flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-char", s.id === sort ? "text-volt" : "text-bone-dim")}
                        >
                          <span className="text-fog">0{i + 1}</span>
                          <span className="flex-1">{s.label}</span>
                          {s.id === sort && <Check size={13} />}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="label text-fog">Active /</span>
            {chips.map((c) => (
              <button key={c.key} onClick={c.remove} className="clip-tag label flex items-center gap-1.5 bg-volt/15 py-1.5 pr-4 pl-2.5 text-bone hover:bg-volt hover:text-ink">
                {c.label} <X size={11} />
              </button>
            ))}
            <button onClick={clear} className="label px-2 text-mute underline-offset-4 hover:text-volt hover:underline">
              Clear all
            </button>
          </div>
        )}

        <div className="grid gap-10 pt-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-36">
              <p className="label mb-1 flex items-center gap-2 text-fog">
                <SlidersHorizontal size={12} /> Tuning
              </p>
              <FilterPanel filters={filters} setFilters={setFilters} />
              {activeCount > 0 && (
                <button onClick={clear} className="label mt-5 text-mute hover:text-volt">
                  ✕ Reset filters
                </button>
              )}
            </div>
          </aside>
          <div>
            {results.length === 0 ? (
              <div className="border-y border-line p-16 text-center">
                <p className="display text-5xl">No matches</p>
                <p className="mt-2 text-mute">Try removing a filter.</p>
                <button onClick={clear} className="label mt-6 text-volt">
                  Clear filters →
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-14 xl:grid-cols-3 xl:gap-x-6">
                <AnimatePresence mode="popLayout">
                  {results.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ProductCard product={p} index={i} initialColor={filters.colors.find((c) => p.colors.includes(c))} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto border-t-2 border-volt bg-coal px-5 pb-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between bg-coal py-4">
                <p className="display text-3xl">Tuning</p>
                <button onClick={() => setDrawer(false)} aria-label="Close filters" className="grid h-10 w-10 place-items-center">
                  <X size={20} />
                </button>
              </div>
              <FilterPanel filters={filters} setFilters={setFilters} />
              <div className="mt-6 grid grid-cols-2 gap-2" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                <button onClick={clear} className="clip-angle-sm label h-12 bg-steel">
                  Clear
                </button>
                <button onClick={() => setDrawer(false)} className="clip-angle-sm label h-12 bg-volt font-bold text-ink">
                  Show {results.length}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
