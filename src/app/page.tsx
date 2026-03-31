import dynamic from "next/dynamic";
import {MortgageCTA} from "@/components/sections/MortgageCTA";
import {HomeValuation} from "@/components/sections/HomeValuation";
import {CuratedListingCTA} from "@/components/sections/CuratedListingsCTA";
import {CallCTA} from "@/components/sections/CallCTA";
import FeaturedListings from "@/components/sections/FeaturedListingsCarousel";
import Contact from "@/components/sections/Contact";
import Credibility from "@/components/sections/Credibility";

const Hero = dynamic(() => import("@/components/sections/Hero").then((m) => m.Hero), {
	ssr: true,
});

export default function HomePage() {
	return (
		<>
			<Hero />
			<FeaturedListings />
			<CuratedListingCTA />
			<MortgageCTA />
			<HomeValuation />
			<Contact />
			<Credibility />
			<CallCTA />
		</>
	);
}
