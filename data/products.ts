import type { Category, Product } from "@/lib/types";

const TEE_CARE = [
  "Machine wash cold, inside out",
  "Do not bleach",
  "Tumble dry low or hang dry",
  "Do not iron directly on print",
];
const HOODIE_CARE = [
  "Machine wash cold with similar colours",
  "Do not bleach or dry clean",
  "Hang dry to keep the loopback soft",
  "Iron inside out on low heat",
];

export const PRODUCTS: Product[] = [
  {
    id: "p-001",
    slug: "essential-oversized-tee",
    name: "Essential Oversized Tee",
    buildName: "Oversized Tee",
    category: "tshirt",
    silhouette: "oversized-tee",
    tagline: "Dropped shoulder. Boxy drape. The studio default.",
    description:
      "Our most customised blank. A dropped-shoulder, boxy tee cut from 220 GSM combed cotton with a tight 1x1 rib collar that keeps its shape wash after wash. Wide canvas front and back make it the go-to base for large-format prints.",
    basePrice: 400,
    images: ["front", "back"],
    colors: ["black", "white"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: true,
    isNew: false,
    rating: 4.8,
    reviews: 1284,
    createdAt: "2026-03-02",
    material: "100% combed cotton, 220 GSM single jersey",
    weight: "220 GSM",
    fit: "Oversized — size down for a regular fit",
    care: TEE_CARE,
    highlights: ["Dropped shoulder", "1x1 rib collar", "Pre-shrunk", "Print-ready surface"],
  },
  {
    id: "p-005",
    slug: "essential-hoodie",
    name: "Essential Hoodie",
    buildName: "Essential Hoodie",
    category: "hoodie",
    silhouette: "hoodie",
    tagline: "Brushed fleece. Double-lined hood. The base build.",
    description:
      "A 320 GSM brushed-back fleece hoodie with a double-layered hood, kangaroo pocket and ribbed cuffs. Clean panels front and back give you maximum room to print.",
    basePrice: 800,
    images: ["front", "back"],
    colors: ["black", "white"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: true,
    isNew: false,
    rating: 4.8,
    reviews: 976,
    createdAt: "2026-01-14",
    material: "80% cotton / 20% polyester brushed fleece, 320 GSM",
    weight: "320 GSM",
    fit: "Regular — relaxed through the body",
    care: HOODIE_CARE,
    highlights: ["Double-layer hood", "Kangaroo pocket", "Rib cuffs & hem", "Flat drawcords"],
  },];

export const CATEGORY_META: Record<Category, { label: string; plural: string; slug: string; blurb: string }> = {
  tshirt: {
    label: "T-Shirt",
    plural: "T-Shirts",
    slug: "t-shirts",
    blurb: "A dropped-shoulder oversized tee — a blank canvas for your build.",
  },
  hoodie: {
    label: "Hoodie",
    plural: "Hoodies",
    slug: "hoodies",
    blurb: "Brushed fleece with a double-lined hood, built to carry big prints.",
  },
};

/** The two base builds offered on the studio's "Choose your build" screen. */
export const DEFAULT_BUILD: Record<Category, string> = {
  tshirt: "essential-oversized-tee",
  hoodie: "essential-hoodie",
};

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getProductsByCategory = (category: Category) => PRODUCTS.filter((p) => p.category === category);
export const categoryFromSlug = (slug: string): Category | undefined =>
  (Object.keys(CATEGORY_META) as Category[]).find((c) => CATEGORY_META[c].slug === slug);

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return PRODUCTS.filter((p) => {
    const haystack = [
      p.name,
      p.tagline,
      p.category,
      CATEGORY_META[p.category].plural,
      CATEGORY_META[p.category].label,
      p.material,
      p.fit,
      ...p.colors,
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

export function relatedProducts(product: Product, count = 4): Product[] {
  const same = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id);
  const other = PRODUCTS.filter((p) => p.category !== product.category);
  return [...same, ...other].slice(0, count);
}
