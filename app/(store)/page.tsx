import { Hero } from "@/components/home/Hero";
import { BuildCTA, CustomizeSteps, Marquee, ShopByCategory, Trending, WhyCustomize } from "@/components/home/Sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <ShopByCategory />
      <CustomizeSteps />
      <Trending />
      <WhyCustomize />
      <BuildCTA />
    </>
  );
}
