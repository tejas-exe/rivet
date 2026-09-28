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
    <div className={cn("relative shrink-0 overflow-hidden bg-char/70", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_30%,rgb(255_46_147/0.16),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgb(34_234_255/0.14),transparent_70%)]" />
      <GarmentPreview
        silhouette={item.silhouette}
        color={item.color}
        face={primaryFace(item.silhouette, item.custom?.designs)}
        designs={item.custom?.designs}
        rich={false}
        className="relative h-full w-full"
      />
      {item.custom && <span className="label absolute top-1.5 left-1.5 -rotate-3 bg-volt px-1 py-px text-[8px]! font-bold text-ink">Custom</span>}
    </div>
  );
}

export function PrintSpecs({ item, className }: { item: CartItem; className?: string }) {
  if (!item.custom?.prints.length) return null;
  return (
    <ul className={cn("space-y-1 font-mono text-[11px] text-mute", className)}>
      {item.custom.prints.map((p) => (
        <li key={p.zone} className="flex flex-wrap gap-x-2">
          <span className="text-cyan uppercase">{ZONE_LABELS[p.zone]} print</span>
          <span>{p.count > 1 ? `${p.count} graphics · ${p.area.toFixed(1)} in²` : formatDims(p.width, p.height)}</span>
          <span className="text-fog">+{formatINR(p.price)}</span>
        </li>
      ))}
    </ul>
  );
}

export function CartLine({ item, compact = false, index }: { item: CartItem; compact?: boolean; index?: number }) {
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
    <div className={cn("group relative isolate flex gap-4", compact ? "py-4" : "py-7 md:gap-6")}>
      {!compact && (
        <span className="absolute inset-y-0 left-0 -z-10 w-full origin-left scale-x-0 bg-gradient-to-r from-volt/[0.07] to-transparent transition-transform duration-300 group-hover:scale-x-100" />
      )}
      <Link href={`/product/${item.productSlug}`} onClick={closeCart}>
        <CartThumb item={item} className={compact ? "h-28 w-24" : "h-44 w-36 md:h-52 md:w-44"} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label mb-1.5 text-volt">
              {item.custom ? "Build" : "Stock"} {String((index ?? 0) + 1).padStart(3, "0")}
            </p>
            <p className={cn("display leading-[0.9]", compact ? "text-2xl" : "text-3xl md:text-4xl")}>
              {item.custom ? `Custom ${item.name}` : item.name}
            </p>
            <p className="label mt-2 text-mute">
              <span className="text-bone">{COLORS[item.color].name}</span> / {item.size}
            </p>
          </div>
          <p className={cn("display tabular-nums", compact ? "text-2xl" : "text-3xl md:text-4xl")}>{formatINR(item.unitPrice * item.quantity)}</p>
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
          <button onClick={editBuild} className="group/edit label inline-flex items-center gap-1.5 text-cyan hover:text-bone">
            <Pencil size={12} /> {item.custom ? "Edit build" : "Customize"}
            <span className="transition-transform duration-200 group-hover/edit:translate-x-1">→</span>
          </button>
          <button onClick={() => remove(item.id)} className="label inline-flex items-center gap-1.5 text-mute hover:text-alert">
            <X size={12} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
