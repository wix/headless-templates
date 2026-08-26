import { CartProvider } from "@/lib/cart";
import type { Kit, Review } from "@/lib/data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductSubnav } from "@/components/product-subnav";
import { Hero } from "@/components/sections/hero";
import { TaglineHero } from "@/components/sections/tagline-hero";
import { KitsCarousel } from "@/components/sections/kits-carousel";
import { FeaturesIntro } from "@/components/sections/features-intro";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { CompareSlider } from "@/components/sections/compare-slider";
import { FrameFeatures } from "@/components/sections/frame-features";
import { QuoteMask } from "@/components/sections/quote-mask";
import { Wishbone } from "@/components/sections/wishbone";
import { StatsSequence } from "@/components/sections/stats-sequence";
import { Geometry } from "@/components/sections/geometry";
import { CarbonLayup, Reviews } from "@/components/sections/reviews";
import { Ender } from "@/components/sections/ender";

export default function HomeApp({
  kits,
  reviews,
}: {
  kits: Kit[];
  reviews: Review[];
}) {
  return (
    <CartProvider>
      <SiteHeader />
      <ProductSubnav />
      <main>
        <Hero />
        <KitsCarousel kits={kits} />
        <TaglineHero />
        <FeaturesIntro />
        <FeaturesGrid />
        <CompareSlider />
        <FrameFeatures />
        <QuoteMask />
        <Wishbone />
        <StatsSequence />
        <Geometry />
        <CarbonLayup />
        <Reviews reviews={reviews} />
        <Ender />
      </main>
      <SiteFooter />
    </CartProvider>
  );
}
