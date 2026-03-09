import dynamic from "next/dynamic";
import { Gallery } from "@/components/sections/Gallery";
import { MortgageCTA } from "@/components/sections/MortgageCTA";
import { Neighborhoods } from "@/components/sections/Neighborhoods";

const Hero = dynamic(
  () => import("@/components/sections/Hero").then((m) => m.Hero),
  {
    ssr: true,
  },
);

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
