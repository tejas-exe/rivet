export type Category = "tshirt" | "hoodie";
export type ColorId = "black" | "white";
export type Size = "S" | "M" | "L" | "XL" | "XXL";
export type PrintZone = "front" | "back" | "leftSleeve" | "rightSleeve";
export type Silhouette = "oversized-tee" | "classic-tee" | "hoodie";

/** Named camera framings of a garment. Used for galleries and the studio camera. */
export type GarmentView = "front" | "back" | "leftSleeve" | "rightSleeve" | "detail";

export interface GarmentColor {
  id: ColorId;
  name: string;
  hex: string;
  /** Swatch colour used in UI chips (garment hex is slightly lifted for shading). */
  swatch: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Short name used in the studio HUD, e.g. "OVERSIZED TEE". */
  buildName: string;
  category: Category;
  silhouette: Silhouette;
  tagline: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  /** Gallery framings rendered by the garment renderer. */
  images: GarmentView[];
  colors: ColorId[];
  sizes: Size[];
  featured: boolean;
  isNew: boolean;
  rating: number;
  reviews: number;
  createdAt: string;
  material: string;
  weight: string;
  fit: string;
  care: string[];
  highlights: string[];
}

/** One placed piece of artwork. Units are inches, relative to its print zone. */
export interface Design {
  id: string;
  zone: PrintZone;
  name: string;
  src: string;
  /** Centre of the artwork, measured from the zone's top-left corner. */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export type DesignsByZone = Record<PrintZone, Design[]>;

export interface PrintZoneSummary {
  zone: PrintZone;
  count: number;
  /** Dimensions of the single artwork, or the bounding extent of several. */
  width: number;
  height: number;
  area: number;
  units: number;
  price: number;
}

export interface CustomBuild {
  designs: DesignsByZone;
  prints: PrintZoneSummary[];
}

export interface CartItem {
  id: string;
  productSlug: string;
  name: string;
  category: Category;
  silhouette: Silhouette;
  color: ColorId;
  size: Size;
  quantity: number;
  basePrice: number;
  printingPrice: number;
  unitPrice: number;
  custom?: CustomBuild;
  addedAt: number;
}

export type ShippingMethod = "standard" | "express";
export type PaymentMethod = "upi" | "card" | "cod";

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pin: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  number: string;
  placedAt: string;
  status: "Processing" | "In Production" | "Shipped" | "Delivered";
  items: CartItem[];
  subtotal: number;
  shipping: number;
  codFee: number;
  total: number;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  email: string;
  address: Omit<Address, "id" | "label">;
}
