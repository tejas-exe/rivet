"use client";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Crosshair, Palette, Ruler, Scissors } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GarmentPreview, zoneBoxStyle } from "@/components/garment/GarmentPreview";
import { GarmentImage } from "@/components/garment/GarmentImage";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeader } from "@/components/ui/misc";
import { COLOR_ORDER } from "@/data/colors";
import { PRESET_GRAPHICS } from "@/data/graphics";
import { CATEGORY_META, PRODUCTS, getProductsByCategory } from "@/data/products";
import { formatINR } from "@/lib/format";
import { priceBuild } from "@/lib/pricing";
import type { Category, DesignsByZone, Silhouette } from "@/lib/types";

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

export function Marquee({ words = ["Wear your design", "Build it", "Customize it", "Make it yours"] }: { words?: string[] }) {
  return (
    <div className="overflow-hidden border-y border-line bg-coal py-5" aria-hidden>
      <div className="flex w-max animate-marquee">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {[...words, ...words].map((w, i) => (
              <span key={i} className="flex items-center">
                <span className={`display px-8 text-4xl md:text-6xl ${i % 2 ? "text-outline" : ""}`}>{w}</span>
                <span className="h-3 w-3 rotate-45 bg-volt" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryTile({ category, index }: { category: Category; index: number }) {
  const meta = CATEGORY_META[category];
  const products = getProductsByCategory(category);
  const from = Math.min(...products.map((p) => p.basePrice));
  const silhouette: Silhouette = category === "hoodie" ? "hoodie" : "oversized-tee";
  return (
    <motion.div {...reveal} transition={{ ...reveal.transition, delay: index * 0.1 }}>
      <Link href={`/shop/${meta.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-char md:aspect-[5/5]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.12),transparent_60%)] transition-opacity duration-700 group-hover:opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[70%] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-3 group-hover:scale-[1.05]">
            <GarmentImage silhouette={silhouette} color={category === "hoodie" ? "black" : "white"} className="w-full" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-24 md:p-8">
          <div>
            <p className="label mb-3 text-bone-dim">
              {formatINR(from)} base · black &amp; white
            </p>
            <p className="display text-[clamp(2.4rem,10vw,4.5rem)] whitespace-nowrap">{meta.plural}</p>
          </div>
          <span className="grid h-14 w-14 shrink-0 place-items-center border border-line-strong transition-colors duration-300 group-hover:border-volt group-hover:bg-volt group-hover:text-ink">
            <ArrowUpRight size={22} />
          </span>
        </div>
        <span className="label absolute top-5 left-5 text-fog">0{index + 1}</span>
      </Link>
    </motion.div>
  );
}

export function ShopByCategory() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHeader index="01" eyebrow="Collection" title={<>Shop by<br />category</>} aside={<p className="max-w-sm text-mute">Premium blanks in black and white. Wear them as they are, or take any piece into the studio.</p>} />
        <div className="mt-12 grid gap-3 md:grid-cols-2">
          <CategoryTile category="tshirt" index={0} />
          <CategoryTile category="hoodie" index={1} />
        </div>
      </Container>
    </section>
  );
}

// ───────────── Customize your own: 3 steps ─────────────
function StepFit() {
  const [i, setI] = useState(0);
  const sils: Silhouette[] = ["oversized-tee", "hoodie"];
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % sils.length), 1800);
    return () => clearInterval(t);
  }, [sils.length]);
  return (
    <div className="relative mx-auto aspect-square h-full">
      {sils.map((s, k) => (
        <motion.div key={s} className="absolute inset-0" animate={{ opacity: k === i ? 1 : 0, scale: k === i ? 1 : 0.92, x: k === i ? 0 : -20 }} transition={{ duration: 0.6 }}>
          <GarmentImage silhouette={s} color="white" rich={false} className="h-full w-full" />
        </motion.div>
      ))}
    </div>
  );
}

function StepDesign() {
  const bolt = PRESET_GRAPHICS[0];
  return (
    <div className="relative mx-auto aspect-[5/6] h-full">
      <GarmentImage silhouette="oversized-tee" color="black" rich={false} className="absolute inset-0 h-full w-full" />
      <div className="absolute border border-dashed border-volt/60" style={zoneBoxStyle("oversized-tee", "front")}>
        <span className="label absolute -top-4 left-0 text-[8px]! text-volt">12 × 16"</span>
        <motion.img
          src={bolt.src}
          alt=""
          className="absolute outline outline-1 outline-volt"
          style={{ width: "40%", left: "30%", top: "20%" }}
          animate={{ x: ["0%", "30%", "-20%", "0%"], rotate: [0, 8, -6, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function StepWear() {
  const stamp = PRESET_GRAPHICS[1];
  const designs: DesignsByZone = {
    front: [],
    back: [{ id: "w", zone: "back", name: "", src: stamp.src, x: 6, y: 6, width: 8, height: 8, rotation: 0 }],
    leftSleeve: [],
    rightSleeve: [],
  };
  return (
    <div className="relative mx-auto aspect-[5/6] h-full">
      <GarmentPreview silhouette="hoodie" color="black" face="back" designs={designs} rich={false} />
      <div className="absolute right-0 bottom-[8%] border border-line-strong bg-ink px-3 py-2">
        <p className="label text-fog">Total</p>
        <p className="font-wide text-base font-black text-volt">{formatINR(priceBuild(800, designs).total)}</p>
      </div>
    </div>
  );
}

export function CustomizeSteps() {
  const steps = [
    { n: "01", title: "Pick your fit", body: "An oversized tee or a brushed-fleece hoodie. Black or white, sizes S–XXL.", visual: <StepFit /> },
    { n: "02", title: "Create your design", body: "Drop in your artwork. Drag, scale and rotate it across front, back and both sleeves — live print sizes shown in inches.", visual: <StepDesign /> },
    { n: "03", title: "Wear your build", body: "Pricing updates as you go: base + ₹50 per 10 in² printed. Finish the build and we make it to order.", visual: <StepWear /> },
  ];
  return (
    <section className="relative overflow-hidden border-y border-line bg-coal py-24 md:py-32">
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-50" />
      <Container className="relative">
        <SectionHeader
          index="02"
          eyebrow="The studio"
          title={<>Customize<br />your own</>}
          aside={
            <ButtonLink href="/customize" icon={<ArrowRight size={14} />}>
              Enter the studio
            </ButtonLink>
          }
        />
        <div className="mt-14 grid gap-px bg-line md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div key={s.n} {...reveal} transition={{ ...reveal.transition, delay: i * 0.12 }} className="group flex flex-col bg-coal p-6 md:p-8">
              <div className="flex items-baseline justify-between">
                <span className="font-wide text-6xl font-black text-steel transition-colors duration-500 group-hover:text-volt">{s.n}</span>
                <span className="label text-fog">Step</span>
              </div>
              <div className="my-8 flex h-[280px] items-center justify-center overflow-hidden">{s.visual}</div>
              <h3 className="display text-3xl md:text-4xl">{s.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-mute">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Trending() {
  const trending = PRODUCTS.flatMap((p) => COLOR_ORDER.filter((c) => p.colors.includes(c)).map((color) => ({ p, color })));
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHeader
          index="03"
          eyebrow="Most built this week"
          title="Trending"
          aside={
            <Link href="/shop" className="label inline-flex items-center gap-2 text-bone hover:text-volt">
              View all products <ArrowRight size={14} />
            </Link>
          }
        />
        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4">
          {trending.map(({ p, color }, i) => (
            <motion.div key={p.id + color} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
              <ProductCard product={p} index={i} initialColor={color} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function WhyCustomize() {
  const items = [
    { icon: Scissors, title: "Your design", body: "Upload PNG, JPG or WEBP artwork — illustrations, photos, type. It prints exactly as you place it." },
    { icon: Crosshair, title: "Your placement", body: "Front, back, left sleeve, right sleeve. Position to the tenth of an inch inside each printable area." },
    { icon: Palette, title: "Your colors", body: "Classic black or clean white on every build. See each colour change live under studio lights." },
    { icon: Ruler, title: "Made for you", body: "Nothing sits in a warehouse. Each build is printed to order in your size, S through XXL." },
  ];
  return (
    <section className="bg-bone py-24 text-ink md:py-32">
      <Container>
        <div className="grid gap-12 xl:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="label mb-4 flex items-center gap-3 text-ink/60">
              <span className="font-bold text-ink">04</span>
              <span className="h-px w-8 bg-ink/30" /> Why build
            </p>
            <h2 className="display text-[clamp(2.2rem,9vw,6.5rem)] xl:text-[min(4.5vw,4.6rem)]">
              Why
              <br />
              customize?
            </h2>
            <p className="mt-8 max-w-sm text-ink/70">
              Fast fashion hands everyone the same thing. The studio hands you the controls — and prices every square inch transparently.
            </p>
          </div>
          <div className="grid gap-px bg-ink/15 sm:grid-cols-2">
            {items.map(({ icon: Icon, title, body }, i) => (
              <motion.div key={title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="group bg-bone p-7 transition-colors duration-500 hover:bg-ink hover:text-bone">
                <div className="mb-10 flex items-center justify-between">
                  <Icon size={26} strokeWidth={1.5} />
                  <span className="label text-ink/40 group-hover:text-volt">0{i + 1}</span>
                </div>
                <h3 className="font-wide text-2xl font-black uppercase">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed opacity-70">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function BuildCTA() {
  return (
    <section className="relative isolate overflow-hidden py-28 md:py-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_100%,rgba(200,255,46,0.16),transparent_55%)]" />
      <div className="bg-blueprint absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_top,black,transparent)]" />
      <Container className="text-center">
        <p className="label mb-8 text-mute">Your garage is open</p>
        <motion.h2 {...reveal} className="display text-[clamp(4rem,16vw,15rem)] leading-[0.8]">
          Build
          <br />
          <span className="text-volt">your own</span>
        </motion.h2>
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/customize" size="xl" className="w-full sm:w-auto" icon={<ArrowRight size={16} />}>
            Start customizing
          </ButtonLink>
          <ButtonLink href="/customize/essential-hoodie" size="xl" variant="ghost" className="w-full sm:w-auto">
            Build a hoodie
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
