"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { GarmentImage } from "@/components/garment/GarmentImage";
import { CATEGORY_META, PRODUCTS, searchProducts } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useUI } from "@/store/ui";

const SUGGESTIONS = ["Hoodie", "Tee", "Black", "White", "Oversized"];

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setSearch = useUI((s) => s.setSearch);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => searchProducts(query), [query]);
  const close = () => setSearch(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (e.key === "/" && !typing && !open && !window.location.pathname.startsWith("/customize")) {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "Escape" && open) setSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setSearch]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    close();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] overflow-y-auto bg-ink/[0.97] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="bg-blueprint pointer-events-none fixed inset-0 opacity-50" />
          <div className="relative mx-auto max-w-[1600px] px-4 pt-6 pb-20 md:px-8">
            <div className="flex justify-end">
              <button onClick={close} className="label flex items-center gap-2 text-mute hover:text-bone" aria-label="Close search">
                Esc <X size={22} />
              </button>
            </div>
            <motion.p
              className="display mt-8 text-[clamp(2.2rem,7vw,6.5rem)]"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              What are you
              <br />
              <span className="text-outline">looking for?</span>
            </motion.p>

            <form onSubmit={submit} className="mt-10 flex items-center gap-4 border-b-2 border-line-strong pb-3 focus-within:border-volt">
              <Search className="shrink-0 text-mute" size={26} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “hood”, “oversized”, “white”…"
                className="w-full bg-transparent font-wide text-2xl font-bold uppercase placeholder:text-fog placeholder:normal-case focus:outline-none md:text-4xl"
                aria-label="Search products"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="label shrink-0 text-mute hover:text-bone">
                  Clear
                </button>
              )}
            </form>

            {!query && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="label mr-2 text-mute">Popular</span>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="label border border-line-strong px-3 py-2 hover:border-volt hover:text-volt">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {query && (
              <p className="label mt-8 text-mute">
                {results.length} result{results.length === 1 ? "" : "s"} for <span className="text-bone">“{query}”</span>
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-px bg-line md:grid-cols-4">
              {(query ? results : PRODUCTS.filter((p) => p.featured)).map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/product/${p.slug}`} onClick={close} className="group block h-full bg-ink p-4 hover:bg-coal">
                    <div className="relative aspect-square bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.07),transparent_65%)]">
                      <GarmentImage silhouette={p.silhouette} color={p.colors[0]} rich={false} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <p className="label mt-3 text-mute">{CATEGORY_META[p.category].label}</p>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <p className="font-wide text-sm font-bold uppercase">{p.name}</p>
                      <p className="font-mono text-xs">{formatINR(p.basePrice)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {query && results.length === 0 && (
              <div className="mt-6 border border-dashed border-line-strong p-10 text-center">
                <p className="display text-3xl">No matches</p>
                <p className="mt-2 text-mute">Nothing in the collection matches that — but you can build it.</p>
                <Link href="/customize" onClick={close} className="label mt-6 inline-flex items-center gap-2 text-volt">
                  Open the studio <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {query && results.length > 0 && (
              <button onClick={submit} className="label mt-8 inline-flex items-center gap-2 text-volt hover:text-bone">
                See all results <ArrowRight size={14} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
