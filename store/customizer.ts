"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_BUILD, getProduct } from "@/data/products";
import { constrainDesign, initialSize } from "@/lib/design";
import { getZone, ZONE_ORDER } from "@/lib/garment";
import { priceBuild } from "@/lib/pricing";
import type { CartItem, ColorId, Design, DesignsByZone, PrintZone, Product, Silhouette, Size } from "@/lib/types";
import { round1, uid } from "@/lib/utils";
import type { NewCartItem } from "./cart";
import { safeStorage } from "./storage";

export type PanelId = "product" | "color" | "size" | PrintZone | "design";

export const PANELS: { id: PanelId; label: string; short: string }[] = [
  { id: "product", label: "Product", short: "Product" },
  { id: "color", label: "Color", short: "Color" },
  { id: "size", label: "Size", short: "Size" },
  { id: "front", label: "Front", short: "Front" },
  { id: "back", label: "Back", short: "Back" },
  { id: "leftSleeve", label: "Left Sleeve", short: "L Sleeve" },
  { id: "rightSleeve", label: "Right Sleeve", short: "R Sleeve" },
  { id: "design", label: "Design", short: "Design" },
];

export const isZonePanel = (p: PanelId): p is PrintZone => (ZONE_ORDER as string[]).includes(p);

export const emptyDesigns = (): DesignsByZone => ({ front: [], back: [], leftSleeve: [], rightSleeve: [] });

export function zoneInches(silhouette: Silhouette, zone: PrintZone) {
  const z = getZone(silhouette, zone);
  return { w: z.widthIn, h: z.heightIn };
}

export interface Artwork {
  src: string;
  name: string;
  aspect: number;
}

interface CustomizerState {
  productSlug: string;
  color: ColorId;
  size: Size;
  panel: PanelId;
  activeZone: PrintZone;
  designs: DesignsByZone;
  selectedId: string | null;
  editingItemId: string | null;

  start: (slug: string, opts?: { color?: ColorId }) => void;
  setProduct: (slug: string) => void;
  setColor: (color: ColorId) => void;
  setSize: (size: Size) => void;
  setPanel: (panel: PanelId) => void;
  setZone: (zone: PrintZone) => void;
  /** Change the viewed zone without leaving the current panel. */
  setActiveZone: (zone: PrintZone) => void;
  select: (id: string | null) => void;
  addDesign: (art: Artwork, zone?: PrintZone) => Design;
  updateDesign: (id: string, patch: Partial<Pick<Design, "x" | "y" | "width" | "height" | "rotation">>) => void;
  removeDesign: (id: string) => void;
  duplicateDesign: (id: string) => void;
  centerDesign: (id: string) => void;
  clearZone: (zone: PrintZone) => void;
  loadCartItem: (item: CartItem) => void;
  reset: (slug?: string) => void;
}

const silhouetteOf = (slug: string): Silhouette => getProduct(slug)?.silhouette ?? "oversized-tee";

function findDesign(designs: DesignsByZone, id: string) {
  for (const z of ZONE_ORDER) {
    const d = designs[z].find((x) => x.id === id);
    if (d) return d;
  }
  return undefined;
}

function reconstrainAll(designs: DesignsByZone, silhouette: Silhouette): DesignsByZone {
  const next = emptyDesigns();
  for (const z of ZONE_ORDER) {
    const { w, h } = zoneInches(silhouette, z);
    next[z] = designs[z].map((d) => constrainDesign(d, w, h));
  }
  return next;
}

const initial = {
  productSlug: DEFAULT_BUILD.tshirt,
  color: "black" as ColorId,
  size: "M" as Size,
  panel: "front" as PanelId,
  activeZone: "front" as PrintZone,
  designs: emptyDesigns(),
  selectedId: null,
  editingItemId: null,
};

export const useCustomizer = create<CustomizerState>()(
  persist(
    (set, get) => ({
      ...initial,

      start: (slug, opts) => {
        const product = getProduct(slug);
        if (!product) return;
        if (slug !== get().productSlug) {
          get().setProduct(slug);
          set({ editingItemId: null });
        }
        if (opts?.color && product.colors.includes(opts.color)) set({ color: opts.color });
      },

      setProduct: (slug) => {
        const product = getProduct(slug);
        if (!product) return;
        const { color, size, designs } = get();
        set({
          productSlug: slug,
          color: product.colors.includes(color) ? color : product.colors[0],
          size: product.sizes.includes(size) ? size : product.sizes.includes("M") ? "M" : product.sizes[0],
          designs: reconstrainAll(designs, product.silhouette),
        });
      },

      setColor: (color) => set({ color }),
      setSize: (size) => set({ size }),

      setPanel: (panel) => {
        if (isZonePanel(panel)) {
          const keepSelection = findDesign(get().designs, get().selectedId ?? "")?.zone === panel;
          set({ panel, activeZone: panel, selectedId: keepSelection ? get().selectedId : get().designs[panel].at(-1)?.id ?? null });
        } else {
          set({ panel });
        }
      },

      setZone: (zone) => get().setPanel(zone),

      setActiveZone: (zone) => {
        const sel = findDesign(get().designs, get().selectedId ?? "");
        set({ activeZone: zone, selectedId: sel?.zone === zone ? sel.id : null });
      },

      select: (id) => {
        if (!id) return set({ selectedId: null });
        const d = findDesign(get().designs, id);
        if (!d) return;
        set({ selectedId: id, activeZone: d.zone, panel: isZonePanel(get().panel) ? d.zone : get().panel });
      },

      addDesign: (art, zone = get().activeZone) => {
        const { w, h } = zoneInches(silhouetteOf(get().productSlug), zone);
        const size = initialSize(art.aspect, w, h);
        const offset = get().designs[zone].length * 0.6;
        const design = constrainDesign(
          { id: uid("art"), zone, name: art.name, src: art.src, x: w / 2 + offset, y: h / 2 + offset, rotation: 0, ...size },
          w,
          h,
        );
        set({
          designs: { ...get().designs, [zone]: [...get().designs[zone], design] },
          selectedId: design.id,
          activeZone: zone,
        });
        return design;
      },

      updateDesign: (id, patch) => {
        const d = findDesign(get().designs, id);
        if (!d) return;
        const { w, h } = zoneInches(silhouetteOf(get().productSlug), d.zone);
        const updated = constrainDesign({ ...d, ...patch }, w, h);
        set({ designs: { ...get().designs, [d.zone]: get().designs[d.zone].map((x) => (x.id === id ? updated : x)) } });
      },

      removeDesign: (id) => {
        const d = findDesign(get().designs, id);
        if (!d) return;
        const remaining = get().designs[d.zone].filter((x) => x.id !== id);
        set({
          designs: { ...get().designs, [d.zone]: remaining },
          selectedId: get().selectedId === id ? remaining.at(-1)?.id ?? null : get().selectedId,
        });
      },

      duplicateDesign: (id) => {
        const d = findDesign(get().designs, id);
        if (!d) return;
        const { w, h } = zoneInches(silhouetteOf(get().productSlug), d.zone);
        const copy = constrainDesign({ ...d, id: uid("art"), x: d.x + 0.8, y: d.y + 0.8 }, w, h);
        set({ designs: { ...get().designs, [d.zone]: [...get().designs[d.zone], copy] }, selectedId: copy.id });
      },

      centerDesign: (id) => {
        const d = findDesign(get().designs, id);
        if (!d) return;
        const { w, h } = zoneInches(silhouetteOf(get().productSlug), d.zone);
        get().updateDesign(id, { x: round1(w / 2), y: round1(h / 2) });
      },

      clearZone: (zone) =>
        set({ designs: { ...get().designs, [zone]: [] }, selectedId: null }),

      loadCartItem: (item) => {
        const product = getProduct(item.productSlug);
        set({
          productSlug: item.productSlug,
          color: item.color,
          size: item.size,
          designs: item.custom ? reconstrainAll(item.custom.designs, product?.silhouette ?? item.silhouette) : emptyDesigns(),
          selectedId: null,
          panel: "front",
          activeZone: "front",
          editingItemId: item.id,
        });
      },

      reset: (slug) => set({ ...initial, productSlug: slug ?? get().productSlug, designs: emptyDesigns() }),
    }),
    {
      name: "rivet-studio-draft",
      storage: safeStorage,
      skipHydration: true,
      version: 1,
      partialize: (s) => ({
        productSlug: s.productSlug,
        color: s.color,
        size: s.size,
        designs: s.designs,
        editingItemId: s.editingItemId,
      }),
    },
  ),
);

/** Snapshot the current build as a cart line. */
export function buildToCartItem(state: Pick<CustomizerState, "productSlug" | "color" | "size" | "designs">, product: Product): NewCartItem {
  const price = priceBuild(product.basePrice, state.designs);
  const hasPrints = price.prints.length > 0;
  return {
    productSlug: product.slug,
    name: product.name,
    category: product.category,
    silhouette: product.silhouette,
    color: state.color,
    size: state.size,
    quantity: 1,
    basePrice: price.base,
    printingPrice: price.printing,
    unitPrice: price.total,
    custom: hasPrints ? { designs: state.designs, prints: price.prints } : undefined,
  };
}
