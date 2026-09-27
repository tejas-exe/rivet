"use client";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/components/layout/StoreHydrator";
import { Container } from "@/components/ui/misc";
import { MOCK_ORDERS } from "@/data/account";
import { cn } from "@/lib/utils";
import { useAccount } from "@/store/account";
import { useOrders } from "@/store/orders";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

const LINKS = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Saved addresses", icon: MapPin },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const profile = useAccount((s) => s.profile);
  const orders = useOrders((s) => s.orders.length) + MOCK_ORDERS.length;
  const wish = useWishlist((s) => s.slugs.length);
  const notify = useUI((s) => s.notify);
  const counts: Record<string, number | undefined> = { "/account/orders": orders, "/account/wishlist": hydrated ? wish : undefined };

  return (
    <Container className="pt-28 pb-10 md:pt-36">
      <div className="mb-10 flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-5">
          <div className="grid h-16 w-16 place-items-center bg-volt font-wide text-2xl font-black text-ink">
            {hydrated ? profile.firstName[0] + profile.lastName[0] : "··"}
          </div>
          <div>
            <p className="label text-mute">{profile.tier}</p>
            <h1 className="display text-4xl md:text-6xl">{hydrated ? `Hey, ${profile.firstName}` : "My account"}</h1>
          </div>
        </div>
        <p className="label text-fog">Demo account — no sign-in required</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Account">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "label flex shrink-0 items-center gap-3 border-l-2 px-4 py-3.5 transition-colors",
                  active ? "border-volt bg-coal text-bone" : "border-transparent text-mute hover:bg-coal hover:text-bone",
                )}
              >
                <Icon size={15} /> {label}
                {counts[href] !== undefined && <span className="ml-auto font-mono text-fog">{counts[href]}</span>}
              </Link>
            );
          })}
          <button onClick={() => notify("Signed out (demo) — your data stays on this device")} className="label flex shrink-0 items-center gap-3 border-l-2 border-transparent px-4 py-3.5 text-fog hover:text-alert">
            <LogOut size={15} /> Sign out
          </button>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
