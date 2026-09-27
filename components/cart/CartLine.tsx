"use client";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GarmentPreview, primaryFace } from "@/components/garment/GarmentPreview";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { COLORS } from "@/data/colors";
import { formatDims, formatINR } from "@/lib/format";
import { ZONE_LABELS } from "@/lib/garment";
import type { CartItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useCustomizer } from "@/store/customizer";
import { useUI } from "@/store/ui";

export function CartThumb({ item, className }: { item: CartItem; className?: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden bg-char", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.09),transparent_65%)]" />
      <GarmentPreview
        silhouette={item.silhouette}
        color={item.color}
        face={primaryFace(item.silhouette, item.custom?.designs)}
        designs={item.custom?.designs}
        rich={false}
        className="relative h-full w-full"
      />
      {item.custom && <span className="label absolute top-1.5 left-1.5 bg-volt px-1 py-px text-[8px]! text-ink">Custom</span>}
    </div>
  );
}

export function PrintSpecs({ item, className }: { item: CartItem; className?: string }) {
  if (!item.custom?.prints.length) return null;
  return (
    <ul className={cn("space-y-1 font-mono text-[11px] text-mute", className)}>
      {item.custom.prints.map((p) => (
        <li key={p.zone} className="flex flex-wrap gap-x-2">
          <span className="text-bone-dim uppercase">{ZONE_LABELS[p.zone]} print</span>
          <span>{p.count > 1 ? `${p.count} graphics · ${p.area.toFixed(1)} in²` : formatDims(p.width, p.height)}</span>
          <span className="text-fog">+{formatINR(p.price)}</span>
        </li>
      ))}
    </ul>
  );
}

export function CartLine({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const router = useRouter();
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const loadCartItem = useCustomizer((s) => s.loadCartItem);
  const closeCart = useUI((s) => s.closeCart);

  const editBuild = () => {
    loadCartItem(item);
    closeCart();
    router.push(`/customize/${item.productSlug}`);
  };

  return (
    <div className={cn("flex gap-4", compact ? "py-4" : "py-6")}>
      <Link href={`/product/${item.productSlug}`} onClick={closeCart}>
        <CartThumb item={item} className={compact ? "h-28 w-24" : "h-40 w-32 md:h-44 md:w-36"} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn("font-wide font-bold uppercase leading-tight", compact ? "text-[13px]" : "text-base")}>
              {item.custom ? `Custom ${item.name}` : item.name}
            </p>
            <p className="label mt-1.5 text-mute">
              {COLORS[item.color].name} / {item.size}
            </p>
          </div>
          <p className="font-mono text-sm tabular-nums">{formatINR(item.unitPrice * item.quantity)}</p>
        </div>

        <PrintSpecs item={item} className="mt-3" />
        {!compact && item.custom && (
          <dl className="mt-3 grid max-w-xs grid-cols-2 gap-y-1 font-mono text-[11px] text-mute">
            <dt>Base</dt>
            <dd className="text-right">{formatINR(item.basePrice)}</dd>
            <dt>Printing</dt>
            <dd className="text-right">{formatINR(item.printingPrice)}</dd>
            <dt className="text-bone-dim">Unit total</dt>
            <dd className="text-right text-bone-dim">{formatINR(item.unitPrice)}</dd>
          </dl>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-4">
          <QuantityStepper size="sm" value={item.quantity} onChange={(q) => setQuantity(item.id, q)} />
          <button onClick={editBuild} className="label inline-flex items-center gap-1.5 text-bone-dim hover:text-volt">
            <Pencil size={12} /> {item.custom ? "Edit build" : "Customize"}
          </button>
          <button onClick={() => remove(item.id)} className="label inline-flex items-center gap-1.5 text-mute hover:text-alert">
            <X size={12} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
