import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomizerStudio } from "@/components/customizer/CustomizerStudio";
import { COLORS, SIZES } from "@/data/colors";
import { getProduct, PRODUCTS } from "@/data/products";
import type { ColorId, Size } from "@/lib/types";

type Props = { params: Promise<{ product: string }>; searchParams: Promise<{ color?: string; size?: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ product: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).product);
  return { title: product ? `Studio — ${product.name}` : "Studio" };
}

export default async function StudioPage({ params, searchParams }: Props) {
  const slug = (await params).product;
  if (!getProduct(slug)) notFound();
  const { color, size } = await searchParams;
  return (
    <CustomizerStudio
      slug={slug}
      color={color && color in COLORS ? (color as ColorId) : undefined}
      size={size && (SIZES as string[]).includes(size) ? (size as Size) : undefined}
    />
  );
}
