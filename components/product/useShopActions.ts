"use client";
import { useCallback } from "react";
import { sound } from "@/lib/sound";
import type { ColorId, Product, Size } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

/** Shared add-to-cart / wishlist behaviour for cards, PDP and wishlist page. */
export function useShopActions() {
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const notify = useUI((s) => s.notify);
  const toggleWish = useWishlist((s) => s.toggle);

  const addToCart = useCallback(
    (product: Product, color: ColorId, size: Size, quantity = 1, open = true) => {
      const item = add({
        productSlug: product.slug,
        name: product.name,
        category: product.category,
        silhouette: product.silhouette,
        color,
        size,
        quantity,
        basePrice: product.basePrice,
        printingPrice: 0,
        unitPrice: product.basePrice,
      });
      sound.play("confirm");
      if (open) openCart(item.id);
      return item;
    },
    [add, openCart],
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      const added = toggleWish(product.slug);
      sound.play(added ? "select" : "tick");
      notify(added ? `${product.name} saved to wishlist` : "Removed from wishlist");
      return added;
    },
    [toggleWish, notify],
  );

  return { addToCart, toggleWishlist };
}
