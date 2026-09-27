import type { ColorId, GarmentColor, Size } from "@/lib/types";

export const COLORS: Record<ColorId, GarmentColor> = {
  black: { id: "black", name: "Black", hex: "#1a1a1b", swatch: "#101011" },
  white: { id: "white", name: "White", hex: "#ecebe6", swatch: "#f2f0ea" },
};

export const COLOR_ORDER: ColorId[] = ["black", "white"];
export const SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

export const colorName = (id: ColorId) => COLORS[id].name;
