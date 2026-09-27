"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/misc";
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

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-line py-5">
      <button onClick={() => setOpen(!open)} className="label flex w-full items-center justify-between text-bone" aria-expanded={open}>
        {title}
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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

function FilterPanel({ category, filters, setFilters }: { category?: Category; filters: Filters; setFilters: (f: Filters) => void }) {
  const cats: { href: string; label: string; active: boolean }[] = [
    { href: "/shop", label: "All", active: !category },
    { href: "/shop/t-shirts", label: "T-Shirts", active: category === "tshirt" },
    { href: "/shop/hoodies", label: "Hoodies", active: category === "hoodie" },
  ];
  return (
    <div>
      <FilterGroup title="Category">
        <div className="flex flex-col gap-2.5">
          {cats.map((c) => (
            <Link key={c.href} href={c.href} className={cn("flex items-center justify-between text-sm transition-colors", c.active ? "text-volt" : "text-bone-dim hover:text-bone")}>
              <span className="flex items-center gap-2.5">
                <span className={cn("h-1.5 w-1.5", c.active ? "bg-volt" : "bg-steel")} />
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Color">
        <div className="grid grid-cols-2 gap-2">
          {COLOR_ORDER.map((c) => {
            const on = filters.colors.includes(c);
            return (
              <button
                key={c}
                onClick={() => setFilters({ ...filters, colors: toggle(filters.colors, c) })}
                aria-pressed={on}
                className={cn("flex items-center gap-2 border px-2.5 py-2 text-left text-xs transition-colors", on ? "border-volt text-bone" : "border-line text-bone-dim hover:border-line-strong")}
              >
                <span className="h-3.5 w-3.5 ring-1 ring-white/20" style={{ background: COLORS[c].swatch }} />
                {COLORS[c].name}
              </button>
            );
          })}
        </div>
      </FilterGroup>
      <FilterGroup title="Size">
        <div className="grid grid-cols-5 gap-1.5">
          {SIZES.map((s) => {
            const on = filters.sizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => setFilters({ ...filters, sizes: toggle(filters.sizes, s) })}
                aria-pressed={on}
                className={cn("h-10 border font-mono text-xs transition-colors", on ? "border-volt bg-volt text-ink" : "border-line text-bone-dim hover:border-line-strong")}
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
  const title = category ? CATEGORY_META[category].plural : "All products";

  const chips = [
    ...filters.colors.map((c) => ({ key: `c-${c}`, label: COLORS[c].name, remove: () => setFilters({ ...filters, colors: toggle(filters.colors, c) }) })),
    ...filters.sizes.map((s) => ({ key: `s-${s}`, label: `Size ${s}`, remove: () => setFilters({ ...filters, sizes: toggle(filters.sizes, s) }) })),
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line pt-32 pb-10 md:pt-40">
        <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Container className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <nav className="label mb-5 flex gap-2 text-fog" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-bone">Home</Link> / <Link href="/shop" className="hover:text-bone">Shop</Link>
              {category && <> / <span className="text-bone-dim">{CATEGORY_META[category].plural}</span></>}
            </nav>
            <h1 className="display text-[clamp(3rem,9vw,8rem)]">{title}</h1>
            <p className="mt-4 max-w-lg text-mute">{category ? CATEGORY_META[category].blurb : "Every blank in the RIVET line-up. Wear it plain or send it to the studio."}</p>
          </div>
          <p className="label text-mute">
            <span className="font-wide text-4xl font-black text-bone">{String(results.length).padStart(2, "0")}</span> products
          </p>
        </Container>
      </section>

      <Container className="pt-6">
        <div className="sticky top-16 z-30 -mx-4 flex items-center justify-between gap-4 border-b border-line bg-ink/85 px-4 py-3 backdrop-blur-lg md:-mx-8 md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawer(true)} className="label flex items-center gap-2 border border-line-strong px-3 py-2.5 hover:border-bone lg:hidden">
              <SlidersHorizontal size={14} /> Filters {activeCount > 0 && <span className="bg-volt px-1 text-ink">{activeCount}</span>}
            </button>
            <div className="hidden flex-wrap gap-2 md:flex">
              {chips.map((c) => (
                <button key={c.key} onClick={c.remove} className="label flex items-center gap-1.5 bg-char px-2.5 py-1.5 text-bone-dim hover:text-bone">
                  {c.label} <X size={11} />
                </button>
              ))}
              {chips.length > 0 && (
                <button onClick={clear} className="label px-2 text-mute underline-offset-4 hover:text-volt hover:underline">
                  Clear all
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)} className="label flex items-center gap-2 py-2.5 text-bone" aria-haspopup="listbox" aria-expanded={sortOpen}>
              <span className="hidden text-fog sm:inline">Sort:</span> {SORTS.find((s) => s.id === sort)!.label}
              <ChevronDown size={14} className={cn("transition-transform", sortOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.ul
                  role="listbox"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-full right-0 z-40 mt-1 w-56 border border-line-strong bg-coal py-1 shadow-2xl"
                >
                  {SORTS.map((s) => (
                    <li key={s.id}>
                      <button
                        role="option"
                        aria-selected={s.id === sort}
                        onClick={() => {
                          setSort(s.id);
                          setSortOpen(false);
                        }}
                        className={cn("label flex w-full items-center justify-between px-4 py-3 text-left hover:bg-char", s.id === sort ? "text-volt" : "text-bone-dim")}
                      >
                        {s.label} {s.id === sort && <Check size={13} />}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-10 pt-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-36">
              <FilterPanel category={category} filters={filters} setFilters={setFilters} />
              {activeCount > 0 && (
                <button onClick={clear} className="label mt-5 text-mute hover:text-volt">
                  Reset filters
                </button>
              )}
            </div>
          </aside>
          <div>
            {results.length === 0 ? (
              <div className="border border-dashed border-line-strong p-16 text-center">
                <p className="display text-3xl">No matches</p>
                <p className="mt-2 text-mute">Try removing a filter.</p>
                <button onClick={clear} className="label mt-6 text-volt">
                  Clear filters
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-12 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {results.map((p, i) => (
                    <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4 }}>
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
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto border-t border-line-strong bg-coal px-5 pb-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
            >
              <div className="sticky top-0 flex items-center justify-between bg-coal py-4">
                <p className="label text-bone">Filters</p>
                <button onClick={() => setDrawer(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              <FilterPanel category={category} filters={filters} setFilters={setFilters} />
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button onClick={clear} className="label h-12 border border-line-strong">
                  Clear
                </button>
                <button onClick={() => setDrawer(false)} className="label h-12 bg-volt font-bold text-ink">
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
