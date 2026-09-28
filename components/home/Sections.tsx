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
import { ArrowMark, Barcode, CornerFrame, NeonGlow, Parallax, ScrollDrift, SectionNumber, StreetTag, TechnicalDivider } from "@/components/ui/street";
import { COLOR_ORDER } from "@/data/colors";
import { PRESET_GRAPHICS } from "@/data/graphics";
import { CATEGORY_META, PRODUCTS, getProductsByCategory } from "@/data/products";
import { formatINR } from "@/lib/format";
import { priceBuild } from "@/lib/pricing";
import type { Category, DesignsByZone, Silhouette } from "@/lib/types";
import { cn } from "@/lib/utils";

const reveal = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

/** Two crossing street-tape bands scrolling in opposite directions. */
export function Marquee({ words = ["Wear your design", "Build it", "Customize it", "Make it yours"] }: { words?: string[] }) {
  const band = (reverse: boolean) => (
    <div className={cn("flex w-max", reverse ? "animate-marquee [animation-direction:reverse]" : "animate-marquee-fast")}>
      {[0, 1].map((k) => (
        <div key={k} className="flex shrink-0 items-center">
          {[...words, ...words].map((w, i) => (
            <span key={i} className="flex items-center">
              <span className={cn("display px-6 text-4xl md:text-6xl", reverse ? (i % 2 ? "text-outline-bone" : "text-bone") : "text-ink")}>{w}</span>
              <span className={cn("label px-2", reverse ? "text-volt" : "text-ink/60")}>{String(i + 1).padStart(3, "0")}</span>
              <span className={cn("mx-4 text-2xl font-black italic", reverse ? "text-cyan" : "text-ink")}>///</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
  return (
    <div className="relative z-10 -my-4 overflow-hidden py-10" aria-hidden>
      <div className="relative -mx-4 -rotate-[2deg] bg-volt py-3 shadow-[0_0_40px_rgb(255_46_147/0.35)]">{band(false)}</div>
      <div className="relative -mx-4 -mt-1.5 rotate-[1.2deg] border-y border-line-strong bg-ink/95 py-3">{band(true)}</div>
    </div>
  );
}

function CategoryTile({ category, index }: { category: Category; index: number }) {
  const meta = CATEGORY_META[category];
  const products = getProductsByCategory(category);
  const from = Math.min(...products.map((p) => p.basePrice));
  const silhouette: Silhouette = category === "hoodie" ? "hoodie" : "oversized-tee";
  const tone = index === 0 ? "255 46 147" : "34 234 255";
  return (
    <motion.div {...reveal} transition={{ ...reveal.transition, delay: index * 0.08 }} className={index === 1 ? "md:mt-24" : ""}>
      <Link href={`/shop/${meta.slug}`} className="group relative block aspect-[4/5] overflow-hidden">
        {/* stage */}
        <div className="absolute inset-0 bg-gradient-to-b from-char/80 via-coal/60 to-transparent" />
        <div
          className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 30%, rgb(${tone} / 0.22), transparent 70%)` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 overflow-hidden opacity-40 transition-opacity duration-300 group-hover:opacity-80">
          <div className="floor-grid absolute inset-x-[-20%] top-0 h-[200%]" />
        </div>
        {/* background word reveals on hover */}
        <p
          aria-hidden
          className="display text-outline-bone pointer-events-none absolute top-[8%] left-1/2 -translate-x-1/2 translate-y-4 text-[clamp(5rem,16vw,13rem)] whitespace-nowrap opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-30"
        >
          {meta.plural}
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[72%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-3 group-hover:scale-[1.05]">
            <GarmentImage silhouette={silhouette} color={category === "hoodie" ? "black" : "white"} className="w-full" />
          </div>
        </div>
        <CornerFrame tone={index === 0 ? "pink" : "cyan"} className="m-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink via-ink/60 to-transparent p-5 pt-28 md:p-8">
          <div>
            <p className="label mb-3 flex items-center gap-2 text-bone-dim">
              <span className={index === 0 ? "text-volt" : "text-cyan"}>Class 0{index + 1}</span> / {formatINR(from)} base
            </p>
            <p className="display text-[clamp(3rem,10vw,5.5rem)] whitespace-nowrap transition-transform duration-200 group-hover:translate-x-2">{meta.plural}</p>
          </div>
          <span className="clip-angle grid h-14 w-14 shrink-0 place-items-center bg-bone/10 transition-colors duration-200 group-hover:bg-volt group-hover:text-ink">
            <ArrowUpRight size={22} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
        <span className="display text-outline absolute top-3 left-4 text-7xl">0{index + 1}</span>
        <StreetTag tone={index === 0 ? "pink" : "cyan"} rotate={index === 0 ? 4 : -4} className="absolute top-5 right-5">
          {index === 0 ? "Street tee" : "Heavy fleece"}
        </StreetTag>
      </Link>
    </motion.div>
  );
}

export function ShopByCategory() {
  return (
    <section className="relative py-24 md:py-32">
      <SectionNumber n="01" className="-top-10 right-0 md:right-8" />
      <Container className="relative">
        <SectionHeader
          index="01"
          eyebrow="Collection"
          title={
            <>
              Shop by
              <br />
              <em>category</em>
            </>
          }
          aside={<p className="max-w-sm text-mute">Premium blanks in black and white. Wear them as they are, or take any piece into the studio.</p>}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-10">
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
        <motion.div key={s} className="absolute inset-0" animate={{ opacity: k === i ? 1 : 0, scale: k === i ? 1 : 0.92, x: k === i ? 0 : -20 }} transition={{ duration: 0.4 }}>
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
      <div className="absolute border border-dashed border-cyan/70" style={zoneBoxStyle("oversized-tee", "front")}>
        <span className="label absolute -top-4 left-0 text-[8px]! text-cyan">12 × 16&quot;</span>
        <motion.img
          src={bolt.src}
          alt=""
          className="absolute outline outline-1 outline-cyan"
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
      <div className="clip-angle-sm absolute right-0 bottom-[8%] border-l-2 border-volt bg-ink/90 px-3 py-2">
        <p className="label text-fog">Total</p>
        <p className="display text-2xl text-volt">{formatINR(priceBuild(800, designs).total)}</p>
      </div>
    </div>
  );
}

export function CustomizeSteps() {
  const steps = [
    { n: "01", tag: "Select base", title: "Pick your fit", body: "An oversized tee or a brushed-fleece hoodie. Black or white, sizes S–XXL.", visual: <StepFit /> },
    { n: "02", tag: "Tune graphics", title: "Create your design", body: "Drop in your artwork. Drag, scale and rotate it across front, back and both sleeves — live print sizes shown in inches.", visual: <StepDesign /> },
    { n: "03", tag: "Hit the street", title: "Wear your build", body: "Pricing updates as you go: base + ₹50 per 10 in² printed. Finish the build and we make it to order.", visual: <StepWear /> },
  ];
  return (
    <section className="relative isolate overflow-hidden border-y border-line py-24 md:py-32">
      <div className="bg-blueprint pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <NeonGlow tone="violet" className="top-0 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2" />
      <ScrollDrift className="pointer-events-none absolute top-1/2 -z-10 w-full -translate-y-1/2 select-none" distance={220}>
        <p aria-hidden className="display text-outline text-[24vw] leading-none whitespace-nowrap">
          Tune it up
        </p>
      </ScrollDrift>
      <Container className="relative">
        <SectionHeader
          index="02"
          eyebrow="The studio"
          title={
            <>
              Customize
              <br />
              <em>your own</em>
            </>
          }
          aside={
            <ButtonLink href="/customize" variant="cyan" icon={<ArrowRight size={14} />}>
              Enter the studio
            </ButtonLink>
          }
        />
        <div className="mt-16 grid md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.1 }}
              className="group relative flex flex-col border-line py-8 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
            >
              <div className="flex items-end justify-between">
                <span className="display text-outline-bone text-8xl transition-colors duration-200 group-hover:text-volt group-hover:[-webkit-text-stroke-color:transparent]">
                  {s.n}
                </span>
                <span className="label pb-2 text-cyan">
                  Stage {s.n} / {s.tag}
                </span>
              </div>
              <div className="relative my-8 flex h-[280px] items-center justify-center overflow-hidden">
                <div className="floor-reflection pointer-events-none absolute inset-x-0 bottom-0 h-16 opacity-60" />
                {s.visual}
              </div>
              <TechnicalDivider meta={`0${i + 1}/03`} className="mb-5" tone={i === 1 ? "cyan" : "pink"} />
              <h3 className="display text-4xl md:text-5xl">{s.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-mute">{s.body}</p>
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
    <section className="relative py-24 md:py-32">
      <SectionNumber n="03" className="top-0 left-0 md:left-6" speed={0.35} />
      <Container className="relative">
        <SectionHeader
          index="03"
          eyebrow="Most built this week"
          title={
            <>
              Trend<em>ing</em>
            </>
          }
          aside={
            <Link href="/shop" className="group label inline-flex items-center gap-3 text-bone hover:text-volt">
              <span className="h-px w-8 bg-current transition-[width] duration-200 group-hover:w-14" />
              View all products <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          }
        />
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-14 lg:grid-cols-4 lg:gap-x-6">
          {trending.map(({ p, color }, i) => (
            <motion.div key={p.id + color} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className={i % 2 ? "lg:mt-16" : ""}>
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
    <section className="relative isolate overflow-hidden py-24 md:py-32">
      <NeonGlow tone="pink" className="top-1/3 -left-40 -z-10 h-[600px] w-[700px]" />
      <div className="speed-lines pointer-events-none absolute inset-0 -z-10 opacity-40" />
      <Container>
        <div className="grid gap-12 xl:grid-cols-[1fr_1.4fr]">
          <div className="xl:sticky xl:top-32 xl:self-start">
            <p className="label mb-5 flex items-center gap-3 text-fog">
              <span className="font-wide text-[13px] font-black tracking-normal text-volt">04</span>
              <span className="h-px w-10 bg-volt/70" /> <span className="text-bone-dim">Why build</span>
            </p>
            <h2 className="display text-[clamp(3rem,10vw,7rem)] xl:text-[min(6vw,6.5rem)]">
              Why
              <br />
              <span className="neon-text text-volt">custom</span>
              <span className="text-outline-bone not-italic">ize?</span>
            </h2>
            <p className="mt-8 max-w-sm text-mute">
              Fast fashion hands everyone the same thing. The studio hands you the controls — and prices every square inch transparently.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Barcode />
              <span className="label text-fog">Spec sheet / RVT-04</span>
            </div>
          </div>
          <div className="border-t border-line">
            {items.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.06 }}
                className="group relative isolate grid grid-cols-[56px_1fr] items-start gap-5 overflow-hidden border-b border-line py-8 md:grid-cols-[80px_1fr_auto] md:py-10"
              >
                <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-gradient-to-r from-volt/15 via-volt/5 to-transparent transition-transform duration-300 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-x-100" />
                <span className="display text-outline-bone text-5xl transition-colors duration-200 group-hover:text-volt group-hover:[-webkit-text-stroke-color:transparent] md:text-6xl">
                  0{i + 1}
                </span>
                <div className="transition-transform duration-200 group-hover:translate-x-2">
                  <h3 className="display text-4xl md:text-5xl">{title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-mute">{body}</p>
                </div>
                <Icon size={28} strokeWidth={1.5} className="hidden text-fog transition-colors duration-200 group-hover:text-cyan md:block" />
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
    <section className="relative isolate overflow-hidden py-28 md:py-44">
      <div className="garage-light absolute inset-0 -z-10" />
      <div className="absolute inset-x-[-20%] bottom-0 -z-10 h-1/2 overflow-hidden">
        <div className="floor-grid absolute inset-x-0 top-0 h-[200%] opacity-70" />
      </div>
      <NeonGlow tone="pink" className="bottom-0 left-1/2 -z-10 h-[400px] w-[900px] -translate-x-1/2" />
      <Container className="relative text-center">
        <p className="label mb-8 flex items-center justify-center gap-3 text-mute">
          <span className="h-1.5 w-1.5 animate-pulse bg-volt" /> Your garage is open <span className="text-fog">/ 24:00</span>
        </p>
        <Parallax speed={0.12}>
          <motion.h2 {...reveal} className="display text-[clamp(4.5rem,18vw,17rem)] leading-[0.78]">
            Build
            <br />
            <span className="text-outline-pink not-italic">your own</span>
          </motion.h2>
        </Parallax>
        <div className="pointer-events-none absolute top-[18%] right-[6%] hidden rotate-6 lg:block">
          <StreetTag tone="acid">No rules</StreetTag>
          <ArrowMark tone="acid" className="mt-2 h-8 w-24 rotate-[140deg]" />
        </div>
        <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
