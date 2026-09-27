import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { COLORS } from "@/data/colors";
import { PRODUCTS, getProduct } from "@/data/products";
import type { ColorId } from "@/lib/types";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ color?: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: product.name, description: product.tagline } : { title: "Product not found" };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const { color } = await searchParams;
  const initialColor = color && color in COLORS ? (color as ColorId) : undefined;
  return <ProductDetail key={product.slug} product={product} initialColor={initialColor} />;
}
