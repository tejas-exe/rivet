"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Check, CreditCard, Loader2, Lock, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartThumb, PrintSpecs } from "@/components/cart/CartLine";
import { useHydrated } from "@/components/layout/StoreHydrator";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState } from "@/components/ui/misc";
import { INDIAN_STATES } from "@/data/account";
import { COLORS } from "@/data/colors";
import { formatINR } from "@/lib/format";
import { COD_FEE, SHIPPING_RATES, shippingFor } from "@/lib/pricing";
import { sound } from "@/lib/sound";
import type { Order, PaymentMethod, ShippingMethod } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { useAccount } from "@/store/account";
import { cartSubtotal, useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";

interface FormState {
  email: string;
  phone: string;
  fullName: string;
  line1: string;
  city: string;
  state: string;
  pin: string;
  upi: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState, payment: PaymentMethod): Errors {
  const e: Errors = {};
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
  if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit mobile number";
  if (f.fullName.trim().length < 2) e.fullName = "Required";
  if (f.line1.trim().length < 6) e.line1 = "Enter your full address";
  if (!f.city.trim()) e.city = "Required";
  if (!f.state) e.state = "Select a state";
  if (!/^\d{6}$/.test(f.pin)) e.pin = "6-digit PIN code";
  if (payment === "upi" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(f.upi)) e.upi = "Enter a UPI ID like name@okbank";
  if (payment === "card") {
    if (f.cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "16-digit card number";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(f.cardExpiry)) e.cardExpiry = "MM/YY";
    if (!/^\d{3,4}$/.test(f.cardCvc)) e.cardCvc = "CVC";
    if (!f.cardName.trim()) e.cardName = "Name on card";
  }
  return e;
}

function Field({
  label,
  error,
  className,
  ...props
}: { label: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("block", className)}>
      <span className={cn("label mb-2 block", error ? "text-alert" : "text-mute")}>{error ? `${label} — ${error}` : label}</span>
      <input
        {...props}
        className={cn(
          "h-12 w-full border bg-ink px-3.5 text-sm transition-colors placeholder:text-fog focus:outline-none",
          error ? "border-alert/70" : "border-line-strong focus:border-volt",
        )}
      />
    </label>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="font-mono text-xs text-volt">{n}</span>
        <h2 className="font-wide text-lg font-black uppercase tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function OptionCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("relative flex w-full items-center gap-4 border p-4 text-left transition-colors", active ? "border-volt bg-volt/[0.04]" : "border-line-strong hover:border-bone")}
    >
      <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-full border", active ? "border-volt" : "border-line-strong")}>
        {active && <span className="h-2 w-2 rounded-full bg-volt" />}
      </span>
      {children}
    </button>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.add);
  const profile = useAccount((s) => s.profile);
  const addresses = useAccount((s) => s.addresses);
  const [shippingMethod, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState<FormState>({
    email: "", phone: "", fullName: "", line1: "", city: "", state: "", pin: "",
    upi: "", cardNumber: "", cardExpiry: "", cardCvc: "", cardName: "",
  });

  // Prefill from the (mock) account once persisted state is available.
  useEffect(() => {
    if (!hydrated) return;
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    setForm((f) => ({
      ...f,
      email: f.email || profile.email,
      phone: f.phone || profile.phone,
      ...(def && !f.line1 ? { fullName: def.fullName, line1: def.line1, city: def.city, state: def.state, pin: def.pin } : {}),
    }));
  }, [hydrated, addresses, profile]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let v = e.target.value;
    if (k === "cardNumber") v = v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (k === "cardExpiry") v = v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
    if (k === "cardCvc") v = v.replace(/\D/g, "").slice(0, 4);
    if (k === "pin") v = v.replace(/\D/g, "").slice(0, 6);
    setForm({ ...form, [k]: v });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal, shippingMethod);
  const codFee = payment === "cod" ? COD_FEE : 0;
  const total = subtotal + shipping + codFee;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form, payment);
    setErrors(errs);
    if (Object.keys(errs).length) {
      sound.play("error");
      document.querySelector("[data-checkout-form]")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1800));
    const order: Order = {
      id: uid("ord"),
      number: `BLD-${Math.floor(10000 + Math.random() * 90000)}`,
      placedAt: new Date().toISOString(),
      status: "Processing",
      items,
      subtotal,
      shipping,
      codFee,
      total,
      shippingMethod,
      paymentMethod: payment,
      email: form.email,
      address: { fullName: form.fullName, phone: form.phone, line1: form.line1, city: form.city, state: form.state, pin: form.pin },
    };
    addOrder(order);
    sound.play("confirm");
    router.push(`/order-success?order=${order.number}`);
    setTimeout(clear, 300);
  };

  if (!hydrated) return <Container className="pt-40"><div className="h-96 animate-pulse bg-coal" /></Container>;

  if (items.length === 0 && !placing)
    return (
      <Container className="pt-40">
        <EmptyState title="Nothing to check out" body="Your cart is empty. Build something first." action={<ButtonLink href="/customize">Start customizing</ButtonLink>} />
      </Container>
    );

  return (
    <Container className="pt-28 md:pt-36">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[clamp(3rem,8vw,6.5rem)]">Checkout</h1>
        <p className="label flex items-center gap-2 text-fog"><Lock size={12} /> Demo — no real payment is processed</p>
      </div>

      <form onSubmit={placeOrder} className="grid gap-12 lg:grid-cols-[1fr_420px]" noValidate data-checkout-form>
        <div>
          <Section n="01" title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} placeholder="you@email.com" />
              <Field label="Phone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="+91 98765 43210" />
            </div>
          </Section>

          <Section n="02" title="Delivery">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" autoComplete="name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} className="sm:col-span-2" />
              <Field label="Address" autoComplete="street-address" value={form.line1} onChange={set("line1")} error={errors.line1} placeholder="House no., building, street, area" className="sm:col-span-2" />
              <Field label="City" autoComplete="address-level2" value={form.city} onChange={set("city")} error={errors.city} />
              <label className="block">
                <span className={cn("label mb-2 block", errors.state ? "text-alert" : "text-mute")}>{errors.state ? `State — ${errors.state}` : "State"}</span>
                <select value={form.state} onChange={set("state")} className={cn("h-12 w-full border bg-ink px-3 text-sm focus:outline-none", errors.state ? "border-alert/70" : "border-line-strong focus:border-volt")}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <Field label="PIN code" inputMode="numeric" autoComplete="postal-code" value={form.pin} onChange={set("pin")} error={errors.pin} placeholder="560038" />
            </div>
          </Section>

          <Section n="03" title="Shipping">
            <div className="grid gap-2">
              <OptionCard active={shippingMethod === "standard"} onClick={() => setShipping("standard")}>
                <div className="flex-1">
                  <p className="font-wide text-sm font-bold uppercase">Standard delivery</p>
                  <p className="text-xs text-mute">5–7 business days</p>
                </div>
                <span className="font-mono text-sm">{shippingFor(subtotal, "standard") === 0 ? <span className="text-volt">Free</span> : formatINR(SHIPPING_RATES.standard)}</span>
              </OptionCard>
              <OptionCard active={shippingMethod === "express"} onClick={() => setShipping("express")}>
                <div className="flex-1">
                  <p className="font-wide text-sm font-bold uppercase">Express delivery</p>
                  <p className="text-xs text-mute">2–3 business days · priority print queue</p>
                </div>
                <span className="font-mono text-sm">{formatINR(SHIPPING_RATES.express)}</span>
              </OptionCard>
            </div>
          </Section>

          <Section n="04" title="Payment">
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "upi", label: "UPI", icon: Smartphone },
                { id: "card", label: "Card", icon: CreditCard },
                { id: "cod", label: "Cash on Delivery", icon: Banknote },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setPayment(id)}
                  aria-pressed={payment === id}
                  className={cn("flex flex-col items-center gap-2 border px-2 py-4 text-center transition-colors", payment === id ? "border-volt text-bone" : "border-line-strong text-bone-dim hover:border-bone")}
                >
                  <Icon size={20} className={payment === id ? "text-volt" : ""} />
                  <span className="label">{label}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={payment} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                {payment === "upi" && (
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <Field label="UPI ID" value={form.upi} onChange={set("upi")} error={errors.upi} placeholder="yourname@okbank" />
                    <p className="text-xs text-mute sm:pb-4">You&apos;ll approve the request in your UPI app.</p>
                  </div>
                )}
                {payment === "card" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Card number" inputMode="numeric" autoComplete="cc-number" value={form.cardNumber} onChange={set("cardNumber")} error={errors.cardNumber} placeholder="4242 4242 4242 4242" className="col-span-2" />
                    <Field label="Expiry" inputMode="numeric" autoComplete="cc-exp" value={form.cardExpiry} onChange={set("cardExpiry")} error={errors.cardExpiry} placeholder="MM/YY" />
                    <Field label="CVC" inputMode="numeric" autoComplete="cc-csc" value={form.cardCvc} onChange={set("cardCvc")} error={errors.cardCvc} placeholder="123" />
                    <Field label="Name on card" autoComplete="cc-name" value={form.cardName} onChange={set("cardName")} error={errors.cardName} className="col-span-2" />
                  </div>
                )}
                {payment === "cod" && (
                  <p className="border border-line p-4 text-sm text-mute">
                    Pay in cash or UPI when your order arrives. A {formatINR(COD_FEE)} handling fee applies.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line bg-coal">
            <p className="label border-b border-line px-6 py-4 text-bone">Order summary</p>
            <div className="max-h-[360px] divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4">
                  <div className="relative">
                    <CartThumb item={item} className="h-20 w-16" />
                    <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center bg-bone font-mono text-[10px] font-bold text-ink">{item.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="truncate text-xs font-bold uppercase">{item.custom ? `Custom ${item.name}` : item.name}</p>
                      <p className="font-mono text-xs">{formatINR(item.unitPrice * item.quantity)}</p>
                    </div>
                    <p className="label mt-1 text-fog">{COLORS[item.color].name} / {item.size}</p>
                    {item.custom ? <PrintSpecs item={item} className="mt-2" /> : <p className="mt-2 font-mono text-[11px] text-fog">No customization</p>}
                  </div>
                </div>
              ))}
            </div>
            <dl className="space-y-2.5 border-t border-line px-6 py-5 font-mono text-sm">
              <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">Shipping ({shippingMethod})</dt><dd>{shipping === 0 ? <span className="text-volt">Free</span> : formatINR(shipping)}</dd></div>
              {codFee > 0 && <div className="flex justify-between"><dt className="text-mute">COD fee</dt><dd>{formatINR(codFee)}</dd></div>}
            </dl>
            <div className="flex items-baseline justify-between border-t border-line px-6 py-5">
              <span className="label text-mute">Total</span>
              <span className="font-wide text-3xl font-black">{formatINR(total)}</span>
            </div>
            <div className="px-6 pb-6">
              <Button type="submit" size="lg" block disabled={placing} silent iconLeft={placing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}>
                {placing ? "Placing order…" : `Place order — ${formatINR(total)}`}
              </Button>
              <Link href="/cart" className="label mt-4 block text-center text-fog hover:text-bone">← Back to cart</Link>
            </div>
          </div>
        </aside>
      </form>

      <AnimatePresence>
        {placing && (
          <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-ink/90 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center">
              <div className="mx-auto mb-8 h-[3px] w-64 overflow-hidden bg-steel">
                <motion.div className="h-full bg-volt" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.7, ease: "easeInOut" }} />
              </div>
              <p className="display text-4xl">Locking in your build</p>
              <p className="label mt-3 text-mute">Confirming payment · Sending to print queue</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}
