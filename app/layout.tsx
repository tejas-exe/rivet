import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MotionProvider } from "@/components/layout/MotionProvider";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], style: ["normal", "italic"], variable: "--font-archivo", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: "RIVET — Wear Your Design", template: "%s — RIVET" },
  description: "Premium custom tees and hoodies. Build it in the RIVET studio, customise it, make it yours.",
};

export const viewport: Viewport = { themeColor: "#06060c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`}>
      <body className="atmos grain">
        <MotionProvider>
          <StoreHydrator />
          {children}
          <CartDrawer />
          <SearchOverlay />
          <Toaster />
        </MotionProvider>
      </body>
    </html>
  );
}
