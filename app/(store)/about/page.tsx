import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { GarmentImage } from "@/components/garment/GarmentImage";
import { ButtonLink } from "@/components/ui/Button";
import { Container, PageHero, SectionHeader } from "@/components/ui/misc";
import { formatINR } from "@/lib/format";
import { PRINT_RATE_INR, PRINT_UNIT_SQ_IN, printingPrice } from "@/lib/pricing";

export const metadata: Metadata = { title: "About" };

const EXAMPLES = [
  { label: "Left-chest logo", w: 3, h: 3 },
  { label: "Sleeve hit", w: 2.5, h: 7 },
  { label: "Front graphic", w: 8, h: 10 },
  { label: "Full back", w: 12, h: 16 },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About RIVET" title={<>A garage<br />for garments</>}>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-dim">
          RIVET started with a simple frustration: custom apparel tools felt like tax forms. We wanted the feeling of tuning a machine — pick the base, dial in the colour, place every graphic to the tenth of an inch, and watch the numbers change as you build.
        </p>
      </PageHero>

      <section className="py-24">
        <Container className="grid items-center gap-16 lg:grid-cols-2">
          <div className="relative aspect-square bg-char">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
            <GarmentImage silhouette="hoodie" color="black" className="absolute inset-[8%] h-[84%] w-[84%]" />
          </div>
          <div>
            <SectionHeader index="01" eyebrow="How we make it" title={<>Blanks worth<br />building on</>} />
            <div className="mt-10 grid gap-px bg-line sm:grid-cols-2">
              {[
                ["220–450 GSM", "Heavy, combed and organic cottons that hold a print and a shape."],
                ["Printed to order", "Nothing is pre-printed. Your build starts production when you place it."],
                ["DTG + DTF", "Direct-to-garment for soft hand-feel, film transfer for sharp detail."],
                ["48h dispatch", "Builds leave our Bengaluru studio within two days of confirmation."],
              ].map(([t, b]) => (
                <div key={t} className="bg-ink p-6">
                  <p className="font-wide text-lg font-black uppercase">{t}</p>
                  <p className="mt-2 text-sm text-mute">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="pricing" className="scroll-mt-24 border-y border-line bg-coal py-24">
        <Container>
          <SectionHeader index="02" eyebrow="Transparent pricing" title={<>Priced by<br />the inch</>} />
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4 font-mono text-sm">
              <p className="text-mute">Every build is the base garment plus printing. Printing is charged per location, by area:</p>
              <pre className="overflow-x-auto border border-line bg-ink p-5 leading-7 text-bone-dim">
{`printArea     = width × height
printingUnits = ceil(printArea / ${PRINT_UNIT_SQ_IN})
printingPrice = printingUnits × ₹${PRINT_RATE_INR}
total         = base + Σ printing`}
              </pre>
              <p className="text-mute">T-shirts start at {formatINR(400)}. Hoodies start at {formatINR(800)}.</p>
            </div>
            <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr className="label text-fog">
                  <th className="border-b border-line-strong py-3 text-left font-normal">Placement</th>
                  <th className="border-b border-line-strong py-3 text-left font-normal">Size</th>
                  <th className="border-b border-line-strong py-3 text-left font-normal">Area</th>
                  <th className="border-b border-line-strong py-3 text-right font-normal">Printing</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((e) => (
                  <tr key={e.label}>
                    <td className="border-b border-line py-4">{e.label}</td>
                    <td className="border-b border-line py-4 text-mute">{e.w} × {e.h}"</td>
                    <td className="border-b border-line py-4 text-mute">{e.w * e.h} in²</td>
                    <td className="border-b border-line py-4 text-right text-volt">{formatINR(printingPrice(e.w * e.h))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container className="text-center">
          <p className="display text-[clamp(3rem,10vw,9rem)]">Your turn.</p>
          <ButtonLink href="/customize" size="xl" className="mt-10" icon={<ArrowRight size={16} />}>
            Enter the studio
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
