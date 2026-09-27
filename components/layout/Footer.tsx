"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/misc";
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
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-coal">
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
            <label className="label mb-3 block text-bone-dim" htmlFor="footer-email">
              Get drop alerts
            </label>
            <div className="flex border-b border-line-strong focus-within:border-volt">
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-transparent py-3 text-sm placeholder:text-fog focus:outline-none"
              />
              <button type="submit" className="px-2 text-bone hover:text-volt" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="label mb-5 text-fog">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-bone-dim transition-colors hover:text-volt">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none select-none overflow-hidden px-4 md:px-8">
        <p className="display text-outline text-center text-[22vw] leading-[0.8] tracking-[-0.06em]">RIVET</p>
      </div>

      <div className="border-t border-line">
        <div className="label mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-5 text-fog md:flex-row md:items-center md:justify-between md:px-8">
          <span>© 2026 RIVET Apparel Co. — Demo storefront. No real orders are placed.</span>
          <span className="flex gap-6">
            <span>UPI</span>
            <span>Cards</span>
            <span>Cash on delivery</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
