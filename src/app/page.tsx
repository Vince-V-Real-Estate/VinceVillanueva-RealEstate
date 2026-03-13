import dynamic from "next/dynamic";
import {MortgageCTA} from "@/components/sections/MortgageCTA";
import {HomeValuation} from "@/components/sections/HomeValuation";
import {ListingsCTA} from "@/components/sections/ListingsCTA";
import {CallCTA} from "@/components/sections/CallCTA";

const Hero = dynamic(() => import("@/components/sections/Hero").then((m) => m.Hero), {
	ssr: true,
});

export default function HomePage() {
	return (
		<>
			<Hero />
			<HomeValuation />
			<ListingsCTA />
			<MortgageCTA />
			<CallCTA />
		</>
	);
}
