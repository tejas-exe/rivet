"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, Store, User, Wand2, X } from "lucide-react";
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

const TICKER = [
  `Free shipping over ${formatINR(FREE_SHIPPING_THRESHOLD)}`,
  "Every build printed to order",
  "Ships in 5–7 days",
  "₹50 per 10 in² of print",
  "Easy 7-day exchanges",
  "Built in Bengaluru",
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
          className="absolute -top-0.5 -right-1 grid h-[17px] min-w-[17px] place-items-center bg-volt px-1 font-mono text-[10px] font-bold text-ink shadow-[0_0_10px_rgb(255_46_147/0.7)]"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/** Mobile bottom dock — thumb-reach navigation. Hidden where a page has its own sticky bar. */
function MobileDock({ count, wishCount }: { count: number; wishCount: number }) {
  const pathname = usePathname();
  const setSearch = useUI((s) => s.setSearch);
  const openCart = useUI((s) => s.openCart);
  if (pathname.startsWith("/product/") || pathname.startsWith("/checkout")) return null;
  const item = "relative flex flex-1 flex-col items-center justify-center gap-1 text-[9px] label tracking-[0.12em]!";
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-ink/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Quick navigation"
    >
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt/70 to-transparent" />
      <div className="flex h-16 items-stretch">
        <Link href="/shop" className={cn(item, isActive(pathname, "/shop") ? "text-bone" : "text-mute")}>
          <Store size={18} /> Shop
        </Link>
        <button onClick={() => setSearch(true)} className={cn(item, "text-mute")}>
          <Search size={18} /> Search
        </button>
        <Link href="/customize" className="relative -mt-4 flex flex-1 flex-col items-center justify-end gap-1 pb-2" aria-label="Customize">
          <span className="clip-angle grid h-12 w-14 place-items-center bg-volt text-ink shadow-[0_0_18px_rgb(255_46_147/0.6)]">
            <Wand2 size={20} />
          </span>
          <span className="label text-[9px]! text-volt">Build</span>
        </Link>
        <Link href="/wishlist" className={cn(item, pathname === "/wishlist" ? "text-bone" : "text-mute")}>
          <span className="relative">
            <Heart size={18} />
            <Badge count={wishCount} />
          </span>
          Saved
        </Link>
        <button onClick={() => openCart()} className={cn(item, "text-mute")} aria-label={`Cart, ${count} items`}>
          <span className="relative">
            <ShoppingBag size={18} />
            <Badge count={count} />
          </span>
          Garage
        </button>
      </div>
    </nav>
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

  const iconBtn = "relative grid h-10 w-10 place-items-center text-bone-dim transition-colors hover:text-cyan";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Ticker strip */}
        <div className={cn("overflow-hidden border-b border-line bg-coal/90 transition-[height] duration-300", scrolled ? "h-0 border-transparent" : "h-7")}>
          <div className="flex h-7 animate-marquee items-center whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex shrink-0 items-center">
                {TICKER.map((t, i) => (
                  <span key={t} className="label flex items-center gap-6 px-6 text-[9.5px]! text-bone-dim">
                    <span className="text-volt">{String(i + 1).padStart(2, "0")}</span>
                    {t}
                    <span className="text-fog">///</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* HUD bar */}
        <div
          className={cn(
            "relative transition-[background-color,backdrop-filter] duration-300",
            scrolled || menuOpen ? "bg-ink/75 backdrop-blur-xl" : "bg-gradient-to-b from-ink/80 to-transparent",
          )}
        >
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-volt/0 via-volt/60 to-cyan/0 transition-opacity duration-300",
              scrolled ? "opacity-100" : "opacity-0",
            )}
          />
          <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 md:px-8">
            <button className={cn(iconBtn, "-ml-2 lg:hidden")} onClick={() => setMenu(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Logo />

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex" aria-label="Primary">
              {NAV.map((item, i) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-baseline gap-1.5 border-l border-line px-4 py-2 font-wide text-[12px] font-extrabold tracking-[0.14em] uppercase italic transition-colors first:border-l-0",
                      active ? "text-bone" : "text-bone-dim/70 hover:text-bone",
                      item.accent && "text-cyan hover:text-cyan",
                    )}
                  >
                    <span className={cn("font-mono text-[9px] not-italic transition-colors", active ? "text-volt" : "text-fog group-hover:text-volt")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
                    {item.accent && <span className="ml-0.5 h-1.5 w-1.5 self-center bg-cyan shadow-[0_0_8px_rgb(34_234_255/0.9)]" />}
                    <span
                      className={cn(
                        "absolute inset-x-4 -bottom-px h-[2px] origin-left transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        item.accent ? "bg-cyan shadow-[0_0_8px_rgb(34_234_255/0.8)]" : "bg-volt shadow-[0_0_8px_rgb(255_46_147/0.8)]",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center">
              <span className="label mr-3 hidden text-[9px]! text-fog 2xl:block">N 12.97° / E 77.59°</span>
              <div className="flex items-center gap-0.5 border-line-strong sm:border-l sm:pl-2">
                <button className={iconBtn} onClick={() => setSearch(true)} aria-label="Search (press /)">
                  <Search size={18} />
                </button>
                <Link href="/account" className={cn(iconBtn, "hidden sm:grid")} aria-label="Account">
                  <User size={18} />
                </Link>
                <Link href="/wishlist" className={cn(iconBtn, "hidden sm:grid")} aria-label="Wishlist">
                  <Heart size={18} />
                  <Badge count={hydrated ? wishCount : 0} />
                </Link>
                <button className={iconBtn} onClick={() => openCart()} aria-label={`Cart, ${count} items`}>
                  <ShoppingBag size={18} />
                  <Badge count={hydrated ? count : 0} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileDock count={hydrated ? count : 0} wishCount={hydrated ? wishCount : 0} />

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-ink pt-24 lg:hidden"
            initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            exit={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            transition={{ duration: 0.4, ease: [0.7, 0, 0.2, 1] }}
          >
            <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-50" />
            <div className="garage-light pointer-events-none absolute inset-0" />
            <span aria-hidden className="display text-outline pointer-events-none absolute -right-6 bottom-24 text-[42vw] leading-none">
              GO
            </span>
            <nav className="relative flex flex-col px-4" aria-label="Mobile">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-line"
                >
                  <Link href={item.href} className="flex items-baseline gap-4 py-3.5">
                    <span className="label text-volt">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("display text-[3rem]", item.accent && "text-cyan neon-text-cyan")}>{item.label}</span>
                    {isActive(pathname, item.href) && <span className="ml-auto h-2 w-2 self-center bg-volt" />}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div
              className="relative mt-auto grid grid-cols-3 border-t border-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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
