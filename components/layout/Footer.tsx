"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/misc";
import { Barcode, NeonGlow, ScrollDrift, StreetTag } from "@/components/ui/street";
import { useUI } from "@/store/ui";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop/t-shirts", label: "T-Shirts" },
      { href: "/shop/hoodies", label: "Hoodies" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/customize", label: "Customization studio" },
      { href: "/customize/essential-oversized-tee", label: "Build a tee" },
      { href: "/customize/essential-hoodie", label: "Build a hoodie" },
      { href: "/about#pricing", label: "Print pricing" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/account/orders", label: "Track order" },
      { href: "/contact#faq", label: "Shipping & returns" },
      { href: "/about", label: "About RIVET" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const notify = useUI((s) => s.notify);

  return (
    <footer className="relative isolate mt-24 overflow-hidden border-t border-line bg-coal/80">
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt/60 to-transparent" />
      <NeonGlow tone="violet" className="-bottom-40 left-1/2 -z-10 h-[520px] w-[1100px] -translate-x-1/2" />
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 pt-16 pb-10 md:px-8 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-mute">
            Premium blanks, printed to order. Every RIVET piece is built by you in the studio and made by us in Bengaluru.
          </p>
          <form
            className="mt-8 max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return notify("Enter a valid email");
              notify("You're on the drop list");
              setEmail("");
            }}
          >
            <label className="label mb-3 flex items-center gap-2 text-bone-dim" htmlFor="footer-email">
              <span className="h-1.5 w-1.5 bg-cyan" /> Get drop alerts
            </label>
            <div className="group flex border-b border-line-strong transition-colors focus-within:border-cyan">
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-transparent py-3 text-sm placeholder:text-fog focus:outline-none"
              />
              <button type="submit" className="px-2 text-bone transition-[color,transform] hover:translate-x-1 hover:text-cyan" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLUMNS.map((col, ci) => (
            <div key={col.title}>
              <p className="label mb-5 flex items-center gap-2 text-fog">
                <span className="text-volt">0{ci + 1}</span> {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="group inline-flex items-center gap-2 text-sm text-bone-dim transition-colors hover:text-bone">
                      <span className="h-px w-0 bg-volt transition-[width] duration-200 group-hover:w-3" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none relative select-none overflow-hidden px-4 md:px-8">
        <ScrollDrift distance={80}>
          <p className="display text-outline text-center text-[26vw] leading-[0.8]">RIVET</p>
        </ScrollDrift>
        <StreetTag className="absolute top-[18%] left-[12%] hidden md:inline-block" rotate={-8}>Drop 001</StreetTag>
        <StreetTag tone="cyan" className="absolute right-[14%] bottom-[22%] hidden md:inline-block" rotate={5}>Custom culture</StreetTag>
      </div>

      <div className="border-t border-line">
        <div className="label mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-5 text-fog md:flex-row md:items-center md:justify-between md:px-8">
          <span>© 2026 RIVET Apparel Co. — Demo storefront. No real orders are placed.</span>
          <span className="flex items-center gap-6">
            <span>UPI</span>
            <span>Cards</span>
            <span>Cash on delivery</span>
            <Barcode className="hidden md:block" />
          </span>
        </div>
      </div>
      {/* Clearance for the mobile bottom dock */}
      <div className="h-16 lg:hidden" aria-hidden />
    </footer>
  );
}
