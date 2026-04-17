import dynamic from "next/dynamic";
import {MortgageCTA} from "@/components/sections/MortgageCTA";
import {HomeValuation} from "@/components/sections/HomeValuation";
import {CuratedListingCTA} from "@/components/sections/CuratedListingsCTA";
import {CallCTA} from "@/components/sections/CallCTA";
import FeaturedListings from "@/components/sections/FeaturedListingsCarousel";
import Contact from "@/components/sections/Contact";
import Credibility from "@/components/sections/Credibility";
import {createLogger} from "@/lib/logger";
import {getHeroImage} from "@/server/hero-image/service";

const Hero = dynamic(() => import("@/components/sections/Hero").then((m) => m.Hero), {
	ssr: true,
});

const log = createLogger("home-page");

export default async function HomePage() {
	let initialHeroImageUrl: string | null = null;

	try {
		const heroImage = await getHeroImage();
		initialHeroImageUrl = heroImage.imageUrl;
	} catch (error) {
		log.warn("Failed to load hero image on server, using defaults", {error});
	}

	return (
		<>
			<Hero initialImageUrl={initialHeroImageUrl} />
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
