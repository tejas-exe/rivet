"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/misc";
import { formatINR } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { cartCount, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

export const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/t-shirts", label: "T-Shirts" },
  { href: "/shop/hoodies", label: "Hoodies" },
  { href: "/customize", label: "Customize", accent: true },
  { href: "/about", label: "About" },
];

const isActive = (pathname: string, href: string) =>
  href === "/shop" ? pathname === "/shop" : pathname === href || pathname.startsWith(`${href}/`);

function Badge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          className="absolute -top-0.5 -right-1 grid h-[17px] min-w-[17px] place-items-center bg-volt px-1 font-mono text-[10px] font-bold text-ink"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const hydrated = useUI((s) => s.hydrated);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const setSearch = useUI((s) => s.setSearch);
  const openCart = useUI((s) => s.openCart);
  const count = useCart((s) => cartCount(s.items));
  const wishCount = useWishlist((s) => s.slugs.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname, setMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const iconBtn = "relative grid h-10 w-10 place-items-center text-bone transition-colors hover:text-volt";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={cn(
            "overflow-hidden border-b border-line bg-volt text-ink transition-[height] duration-300",
            scrolled ? "h-0 border-transparent" : "h-8",
          )}
        >
          <div className="flex h-8 animate-marquee items-center whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex shrink-0 items-center">
                {[
                  `Free shipping over ${formatINR(FREE_SHIPPING_THRESHOLD)}`,
                  "Every build printed to order",
                  "Ships in 5–7 days",
                  "₹50 per 10 in² of print",
                  "Easy 7-day exchanges",
                  "Built in Bengaluru",
                ].map((t) => (
                  <span key={t} className="label flex items-center gap-8 px-8 font-bold">
                    {t} <span className="h-1 w-1 rotate-45 bg-ink" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "border-b transition-[background-color,border-color,backdrop-filter] duration-500",
            scrolled || menuOpen ? "border-line bg-ink/70 backdrop-blur-xl" : "border-transparent bg-transparent",
          )}
        >
          <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 md:px-8">
            <button className={cn(iconBtn, "-ml-2 lg:hidden")} onClick={() => setMenu(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Logo />

            <nav className="ml-10 hidden items-center gap-1 lg:flex" aria-label="Primary">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative px-3.5 py-2 font-wide text-[11.5px] font-bold uppercase tracking-[0.14em] transition-colors",
                      active ? "text-bone" : "text-bone-dim/70 hover:text-bone",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {item.accent && <span className="h-1.5 w-1.5 animate-pulse bg-volt" />}
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "absolute inset-x-3.5 -bottom-px h-px origin-left bg-volt transition-transform duration-300",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-0.5">
              <button className={iconBtn} onClick={() => setSearch(true)} aria-label="Search (press /)">
                <Search size={19} />
              </button>
              <Link href="/account" className={cn(iconBtn, "hidden sm:grid")} aria-label="Account">
                <User size={19} />
              </Link>
              <Link href="/wishlist" className={cn(iconBtn, "hidden sm:grid")} aria-label="Wishlist">
                <Heart size={19} />
                <Badge count={hydrated ? wishCount : 0} />
              </Link>
              <button className={iconBtn} onClick={() => openCart()} aria-label={`Cart, ${count} items`}>
                <ShoppingBag size={19} />
                <Badge count={hydrated ? count : 0} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-ink pt-24 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-40" />
            <nav className="relative flex flex-col px-4" aria-label="Mobile">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-line"
                >
                  <Link href={item.href} className="flex items-center justify-between py-4">
                    <span className={cn("display text-[2.6rem]", item.accent && "text-volt")}>{item.label}</span>
                    <span className="label text-fog">0{i + 1}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div
              className="relative mt-auto grid grid-cols-3 border-t border-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { href: "/account", label: "Account", icon: User },
                { href: "/wishlist", label: "Wishlist", icon: Heart },
                { href: "/cart", label: "Cart", icon: ShoppingBag },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="label flex flex-col items-center gap-2 border-r border-line py-6 last:border-r-0">
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
