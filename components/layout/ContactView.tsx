"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container, PageHero } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const FAQ = [
  ["How long does a custom build take?", "Builds are printed within 48 hours of your order and ship in 5–7 business days (2–3 with Express)."],
  ["What files can I upload?", "PNG, JPG, JPEG or WEBP. For best results use a transparent PNG at 300 DPI at the size you plan to print."],
  ["Can I return a custom piece?", "Custom builds can be exchanged for size within 7 days if unworn. Plain blanks can be returned within 7 days."],
  ["How is printing priced?", "₹50 for every 10 square inches of artwork, rounded up, per print location. The studio shows the exact price as you resize."],
  ["Do you ship across India?", "Yes — to every serviceable PIN code. Standard shipping is free over ₹1,499."],
];

export function ContactView() {
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", email: "", topic: "Order support", message: "" });
  const valid = form.name.trim() && /^\S+@\S+\.\S+$/.test(form.email) && form.message.trim().length > 5;
  const field = "h-12 w-full border border-line-strong bg-ink px-3.5 text-sm focus:border-volt focus:outline-none";

  return (
    <>
      <PageHero eyebrow="Contact" title={<>Talk to<br />the garage</>} />
      <Container className="grid gap-16 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8">
          {[
            { icon: Mail, k: "Email", v: "studio@rivet.example" },
            { icon: Phone, k: "Phone", v: "+91 80 4000 1234 · Mon–Sat, 10–7" },
            { icon: MapPin, k: "Studio", v: "Workshop Block, Koramangala, Bengaluru 560095" },
          ].map(({ icon: Icon, k, v }) => (
            <div key={k} className="flex gap-4">
              <Icon size={18} className="mt-0.5 text-volt" />
              <div>
                <p className="label text-fog">{k}</p>
                <p className="mt-1">{v}</p>
              </div>
            </div>
          ))}
          <div id="faq" className="scroll-mt-28 pt-6">
            <p className="label mb-4 text-mute">FAQ</p>
            <div className="border-t border-line">
              {FAQ.map(([q, a], i) => (
                <div key={q} className="border-b border-line">
                  <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold uppercase" aria-expanded={open === i}>
                    {q}
                    <ChevronDown size={14} className={cn("shrink-0 transition-transform", open === i && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.p initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden text-sm text-mute">
                        <span className="block pb-4">{a}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-line bg-coal p-6 md:p-10">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-start justify-center py-16">
                <span className="mb-6 grid h-12 w-12 place-items-center bg-volt text-ink"><Check strokeWidth={3} /></span>
                <p className="display text-4xl">Message received</p>
                <p className="mt-3 text-mute">Thanks {form.name.split(" ")[0]} — we reply within one working day.</p>
                <button onClick={() => { setSent(false); setForm({ ...form, message: "" }); }} className="label mt-8 text-volt">Send another</button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (valid) setSent(true);
                }}
                className="space-y-4"
              >
                <p className="font-wide text-xl font-black uppercase">Send a message</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={field} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Name" />
                  <input className={field} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-label="Email" />
                </div>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
                  {["Order support", "Custom build help", "Bulk / team orders", "Other"].map((t) => (
                    <button type="button" key={t} onClick={() => setForm({ ...form, topic: t })} className={cn("label border px-3 py-2", form.topic === t ? "border-volt text-volt" : "border-line-strong text-mute")}>
                      {t}
                    </button>
                  ))}
                </div>
                <textarea className={cn(field, "h-40 py-3")} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-label="Message" />
                <Button type="submit" size="lg" block disabled={!valid}>Send message</Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </>
  );
}
