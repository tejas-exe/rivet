import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/ShopView";
import { CATEGORY_META, categoryFromSlug } from "@/data/products";

export function generateStaticParams() {
  return Object.values(CATEGORY_META).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const cat = categoryFromSlug((await params).category);
  return { title: cat ? CATEGORY_META[cat].plural : "Shop" };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = categoryFromSlug((await params).category);
  if (!category) notFound();
  return <ShopView category={category} />;
}
