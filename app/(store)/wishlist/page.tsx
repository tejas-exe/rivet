import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui/misc";
import { WishlistGrid } from "@/components/wishlist/WishlistGrid";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <>
      <PageHero eyebrow="Saved for later" title="Wishlist" />
      <Container className="py-12">
        <WishlistGrid />
      </Container>
    </>
  );
}
