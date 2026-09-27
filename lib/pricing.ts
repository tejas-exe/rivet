/**
 * Build pricing — the single source of truth for every price shown in the
 * studio HUD, build summary, cart and checkout.
 *
 *   printArea     = width × height                (per artwork, inches)
 *   printingUnits = Math.ceil(printArea / 10)     (per print location)
 *   printingPrice = printingUnits × ₹50
 *   total         = basePrice + Σ printingPrice   (all print locations)
 *
 * Artwork dimensions are stored at 0.1" precision, so the area we price is
 * exactly the area we display.
 */
import { ZONE_ORDER } from "./garment";
import type { Design, DesignsByZone, PrintZone, PrintZoneSummary } from "./types";
import { round2 } from "./utils";

export const PRINT_RATE_INR = 50;
export const PRINT_UNIT_SQ_IN = 10;

export const designArea = (d: Pick<Design, "width" | "height">) => round2(d.width * d.height);

export function printingUnits(printArea: number): number {
  if (printArea <= 0) return 0;
  // Guard against float noise such as 100.00000000001.
  return Math.ceil(round2(printArea) / PRINT_UNIT_SQ_IN - 1e-9);
}

export const printingPrice = (printArea: number) => printingUnits(printArea) * PRINT_RATE_INR;

export function summarizeZone(zone: PrintZone, designs: Design[]): PrintZoneSummary | null {
  if (designs.length === 0) return null;
  const area = round2(designs.reduce((sum, d) => sum + designArea(d), 0));
  const units = printingUnits(area);
  const single = designs.length === 1 ? designs[0] : null;
  return {
    zone,
    count: designs.length,
    width: single ? single.width : Math.max(...designs.map((d) => d.width)),
    height: single ? single.height : Math.max(...designs.map((d) => d.height)),
    area,
    units,
    price: units * PRINT_RATE_INR,
  };
}

export interface BuildPrice {
  base: number;
  prints: PrintZoneSummary[];
  printing: number;
  total: number;
}

export function priceBuild(basePrice: number, designs: DesignsByZone): BuildPrice {
  const prints = ZONE_ORDER.map((z) => summarizeZone(z, designs[z] ?? [])).filter(
    (s): s is PrintZoneSummary => s !== null,
  );
  const printing = prints.reduce((sum, p) => sum + p.price, 0);
  return { base: basePrice, prints, printing, total: basePrice + printing };
}

// ───────────── Cart-level pricing ─────────────
export const FREE_SHIPPING_THRESHOLD = 1499;
export const SHIPPING_RATES = { standard: 79, express: 149 } as const;
export const COD_FEE = 49;

export function shippingFor(subtotal: number, method: "standard" | "express" = "standard") {
  if (subtotal === 0) return 0;
  if (method === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_RATES[method];
}
