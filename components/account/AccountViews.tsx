"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CartThumb, PrintSpecs } from "@/components/cart/CartLine";
import { useHydrated } from "@/components/layout/StoreHydrator";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";
import { INDIAN_STATES, MOCK_ORDERS } from "@/data/account";
import { COLORS } from "@/data/colors";
import { formatDate, formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAccount, type Profile } from "@/store/account";
import { useOrders } from "@/store/orders";
import { useUI } from "@/store/ui";

const input = "h-12 w-full border border-line-strong bg-ink px-3.5 text-sm focus:border-volt focus:outline-none";

export function ProfileView() {
  const hydrated = useHydrated();
  const profile = useAccount((s) => s.profile);
  const update = useAccount((s) => s.updateProfile);
  const notify = useUI((s) => s.notify);
  const [draft, setDraft] = useState<Profile>(profile);
  useEffect(() => setDraft(profile), [profile]);

  if (!hydrated) return <div className="h-80 animate-pulse bg-coal" />;
  const fields: { key: keyof Profile; label: string; type?: string }[] = [
    { key: "firstName", label: "First name" },
    { key: "lastName", label: "Last name" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
  ];
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-3">
        {[
          ["Member since", formatDate(profile.memberSince)],
          ["Builds ordered", String(MOCK_ORDERS.length + useOrders.getState().orders.length)],
          ["Status", profile.tier],
        ].map(([k, v]) => (
          <div key={k} className="bg-ink p-5">
            <p className="label text-fog">{k}</p>
            <p className="mt-2 font-wide text-lg font-bold">{v}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update(draft);
          notify("Profile saved");
        }}
      >
        <h2 className="mb-6 font-wide text-lg font-black uppercase">Profile details</h2>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <label key={f.key} className="block">
              <span className="label mb-2 block text-mute">{f.label}</span>
              <input type={f.type ?? "text"} value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} className={input} />
            </label>
          ))}
        </div>
        <Button type="submit" className="mt-6">Save changes</Button>
      </form>
    </div>
  );
}

const STATUS_STEPS: Order["status"][] = ["Processing", "In Production", "Shipped", "Delivered"];

function OrderCard({ order, defaultOpen }: { order: Order; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const step = STATUS_STEPS.indexOf(order.status);
  return (
    <div id={order.number} className={cn("border bg-coal transition-colors", defaultOpen ? "border-volt/60" : "border-line")}>
      <button onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center gap-x-8 gap-y-3 p-5 text-left" aria-expanded={open}>
        <div>
          <p className="label text-fog">Order</p>
          <p className="font-mono text-sm">#{order.number}</p>
        </div>
        <div>
          <p className="label text-fog">Placed</p>
          <p className="font-mono text-sm">{formatDate(order.placedAt)}</p>
        </div>
        <div>
          <p className="label text-fog">Total</p>
          <p className="font-mono text-sm">{formatINR(order.total)}</p>
        </div>
        <span className={cn("label ml-auto px-2 py-1", order.status === "Delivered" ? "bg-steel text-bone-dim" : "bg-volt text-ink")}>{order.status}</span>
        <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-line px-5 py-5">
              <div className="mb-6 grid grid-cols-4 gap-1">
                {STATUS_STEPS.map((s, i) => (
                  <div key={s}>
                    <div className={cn("h-1", i <= step ? "bg-volt" : "bg-steel")} />
                    <p className={cn("label mt-2 text-[9px]!", i <= step ? "text-bone" : "text-fog")}>{s}</p>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-line">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <CartThumb item={item} className="h-20 w-16" />
                    <div className="flex-1">
                      <div className="flex justify-between gap-2">
                        <Link href={`/product/${item.productSlug}`} className="text-sm font-bold uppercase hover:text-volt">
                          {item.custom ? `Custom ${item.name}` : item.name}
                        </Link>
                        <span className="font-mono text-sm">{formatINR(item.unitPrice * item.quantity)}</span>
                      </div>
                      <p className="label mt-1 text-fog">{COLORS[item.color].name} / {item.size} · Qty {item.quantity}</p>
                      <PrintSpecs item={item} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-mute">
                Ship to {order.address.fullName}, {order.address.line1}, {order.address.city} {order.address.pin}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OrdersView() {
  const hydrated = useHydrated();
  const placed = useOrders((s) => s.orders);
  const highlight = useSearchParams().get("order");
  const orders = [...placed, ...MOCK_ORDERS];

  useEffect(() => {
    if (hydrated && highlight) document.getElementById(highlight)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [hydrated, highlight]);

  if (!hydrated) return <div className="h-80 animate-pulse bg-coal" />;
  if (orders.length === 0) return <EmptyState title="No orders yet" body="Your builds will show up here." action={<ButtonLink href="/customize">Start a build</ButtonLink>} />;
  return (
    <div className="space-y-3">
      <h2 className="mb-6 font-wide text-lg font-black uppercase">Order history</h2>
      {orders.map((o, i) => (
        <OrderCard key={o.id} order={o} defaultOpen={highlight ? o.number === highlight : i === 0} />
      ))}
    </div>
  );
}

export function AddressesView() {
  const hydrated = useHydrated();
  const addresses = useAccount((s) => s.addresses);
  const { addAddress, removeAddress, setDefault } = useAccount.getState();
  const notify = useUI((s) => s.notify);
  const [adding, setAdding] = useState(false);
  const empty = { label: "", fullName: "", phone: "", line1: "", city: "", state: "", pin: "" };
  const [draft, setDraft] = useState(empty);

  if (!hydrated) return <div className="h-80 animate-pulse bg-coal" />;
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-wide text-lg font-black uppercase">Saved addresses</h2>
        <Button size="sm" variant="ghost" iconLeft={<Plus size={14} />} onClick={() => setAdding(!adding)}>
          {adding ? "Cancel" : "Add address"}
        </Button>
      </div>
      <AnimatePresence>
        {adding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.fullName || !draft.line1 || !draft.city || !draft.state || !/^\d{6}$/.test(draft.pin)) return notify("Fill all fields (6-digit PIN)");
              addAddress({ ...draft, label: draft.label || "Other" });
              setDraft(empty);
              setAdding(false);
              notify("Address saved");
            }}
          >
            <div className="grid gap-3 border border-line p-5 sm:grid-cols-2">
              <input placeholder="Label (Home, Work…)" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className={input} />
              <input placeholder="Full name" value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} className={input} />
              <input placeholder="Address" value={draft.line1} onChange={(e) => setDraft({ ...draft, line1: e.target.value })} className={cn(input, "sm:col-span-2")} />
              <input placeholder="City" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} className={input} />
              <select value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })} className={input}>
                <option value="">State</option>
                {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <input placeholder="PIN code" inputMode="numeric" value={draft.pin} onChange={(e) => setDraft({ ...draft, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} className={input} />
              <input placeholder="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={input} />
              <Button type="submit" className="sm:col-span-2">Save address</Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <div className="grid gap-3 md:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className={cn("flex flex-col border p-5", a.isDefault ? "border-volt/60 bg-coal" : "border-line")}>
            <div className="mb-3 flex items-center justify-between">
              <p className="label text-bone">{a.label}</p>
              {a.isDefault && <span className="label bg-volt px-1.5 text-ink">Default</span>}
            </div>
            <p className="text-sm font-bold">{a.fullName}</p>
            <p className="mt-1 text-sm text-mute">{a.line1}</p>
            <p className="text-sm text-mute">{a.city}, {a.state} {a.pin}</p>
            <p className="mt-1 font-mono text-xs text-fog">{a.phone}</p>
            <div className="mt-auto flex gap-5 pt-5">
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)} className="label text-bone-dim hover:text-volt">Set as default</button>
              )}
              <button onClick={() => removeAddress(a.id)} className="label inline-flex items-center gap-1.5 text-mute hover:text-alert">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {addresses.length === 0 && <p className="text-mute">No saved addresses.</p>}
    </div>
  );
}
