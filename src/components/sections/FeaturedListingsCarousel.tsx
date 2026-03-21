"use client";
import {useEffect, useState} from "react";

import {LeadCaptureForm} from "@/components/forms/lead-capture";
import Carousel, {type SlideData} from "@/components/ui/carousel";
import {fetchFeaturedListings} from "@/lib/featured-listings/client";
import {mapFeaturedListingToCarouselSlide} from "@/lib/featured-listings/mappers";
import {createLogger} from "@/lib/logger";

const log = createLogger("featured-listings");

export default function FeaturedListings() {
	const [slides, setSlides] = useState<SlideData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	useEffect(() => {
		const controller = new AbortController();

		const loadFeaturedListings = async () => {
			try {
				const listings = await fetchFeaturedListings({
					signal: controller.signal,
				});
				setSlides(listings.map(mapFeaturedListingToCarouselSlide));
				setLoadError(null);
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}

				log.error("Failed to load featured listings carousel", error);
				setLoadError("Featured listings are temporarily unavailable.");
				setSlides([]);
			} finally {
				setIsLoading(false);
			}
		};

		void loadFeaturedListings();

		return () => {
			controller.abort();
		};
	}, []);
	return (
		<>
			<section className="w-full overflow-hidden bg-zinc-100 py-24 md:py-32">
				<h2 className="text-center text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Featured Listings</h2>
				<div className="relative flex w-full items-center justify-center py-10 xl:mx-auto xl:w-full">
					{isLoading ? (
						<div className="flex h-[60vmin] w-[60vmin] items-center justify-center rounded-2xl bg-gray-100 text-gray-500 md:h-[40vmin] md:w-[40vmin]">Loading featured listings...</div>
					) : slides.length > 0 ? (
						<Carousel slides={slides} />
					) : (
						<div className="flex h-[60vmin] w-[60vmin] items-center justify-center rounded-2xl bg-gray-100 px-6 text-center text-gray-500 md:h-[40vmin] md:w-[40vmin]">{loadError ?? "No featured listings available yet."}</div>
					)}
				</div>
			</section>
		</>
	);
}
