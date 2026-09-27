import type { Metadata } from "next";
import { SearchResults } from "@/components/shop/SearchResults";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <SearchResults initialQuery={q} />;
}
