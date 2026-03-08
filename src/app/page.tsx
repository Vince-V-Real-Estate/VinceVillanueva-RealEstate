import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { MortgageCTA } from "@/components/sections/MortgageCTA";
import { Neighborhoods } from "@/components/sections/Neighborhoods";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MortgageCTA />
      <Gallery />
      <Neighborhoods />
    </>
  );
}
