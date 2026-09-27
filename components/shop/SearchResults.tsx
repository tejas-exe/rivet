"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState } from "@/components/ui/misc";
import { PRODUCTS, searchProducts } from "@/data/products";

export function SearchResults({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const results = useMemo(() => searchProducts(query), [query]);

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  // Keep the URL shareable without adding history entries per keystroke.
  useEffect(() => {
    const t = setTimeout(() => router.replace(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search", { scroll: false }), 300);
    return () => clearTimeout(t);
  }, [query, router]);

  return (
    <>
      <section className="border-b border-line pt-32 pb-10 md:pt-40">
        <Container>
          <p className="label mb-5 text-mute">Search</p>
          <div className="flex items-center gap-4 border-b-2 border-line-strong pb-3 focus-within:border-volt">
            <Search size={28} className="shrink-0 text-mute" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search products"
              className="display w-full bg-transparent text-[clamp(2rem,6vw,5rem)] placeholder:text-steel focus:outline-none"
            />
          </div>
          <p className="label mt-5 text-mute">
            {query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : `Browse all ${PRODUCTS.length} products`}
          </p>
        </Container>
      </section>
      <Container className="py-12">
        {query.trim() && results.length === 0 ? (
          <EmptyState title="No matches" body={`Nothing matches “${query}”. Try “hoodie”, “oversized” or a colour.`} action={<ButtonLink href="/customize">Build it instead</ButtonLink>} />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-12 lg:grid-cols-4">
            {(query.trim() ? results : PRODUCTS).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
