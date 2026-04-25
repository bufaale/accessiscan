import { TitleIIBanner } from "@/components/landing/title-ii-banner";
import { Hero } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/trust-strip";
import { Stats } from "@/components/landing/stats";
import { ProductTruth } from "@/components/landing/product-truth";
import { Comparison } from "@/components/landing/comparison";
import { RoiCalculator } from "@/components/landing/roi-calculator";
import { GovCTA } from "@/components/landing/gov-cta";
import { Pricing } from "@/components/landing/pricing";
import { FinalCTA } from "@/components/landing/final-cta";

export default function HomePage() {
  return (
    <>
      <TitleIIBanner />
      <Hero />
      <TrustStrip />
      <Stats />
      <ProductTruth />
      <Comparison />
      <RoiCalculator />
      <GovCTA />
      <Pricing />
      <FinalCTA />
    </>
  );
}
