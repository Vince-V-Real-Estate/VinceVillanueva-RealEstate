"use client";

import { useEffect, useState } from "react";

import { LeadCaptureForm } from "@/components/forms/lead-capture";
import Carousel, { type SlideData } from "@/components/ui/carousel";
import { fetchFeaturedListings } from "@/lib/featured-listings/client";
import { mapFeaturedListingToCarouselSlide } from "@/lib/featured-listings/mappers";
import { createLogger } from "@/lib/logger";

const log = createLogger("listings-cta");

export function ListingsCTA() {
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
    <section className="w-full overflow-hidden bg-zinc-50 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-0">
          <div className="m-auto w-full">
            <h2 className="text-center text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Featured Listings
            </h2>
            <div className="relative flex w-full items-center justify-center py-10 xl:mx-auto xl:w-full">
              {isLoading ? (
                <div className="flex h-[60vmin] w-[60vmin] items-center justify-center rounded-2xl bg-gray-100 text-gray-500 md:h-[40vmin] md:w-[40vmin]">
                  Loading featured listings...
                </div>
              ) : slides.length > 0 ? (
                <Carousel slides={slides} />
              ) : (
                <div className="flex h-[60vmin] w-[60vmin] items-center justify-center rounded-2xl bg-gray-100 px-6 text-center text-gray-500 md:h-[40vmin] md:w-[40vmin]">
                  {loadError ?? "No featured listings available yet."}
                </div>
              )}
            </div>
          </div>

          <div className="w-full space-y-8 lg:w-1/2 xl:mr-40">
            <div className="space-y-4">
              <h2 className="text-4xl font-light tracking-tight text-gray-900 sm:text-5xl">
                Curated Listings <br />
                <span className="font-serif text-black italic">
                  Direct to Inbox
                </span>
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-gray-500">
                Don&apos;t miss out on new opportunities. Get customized alerts
                for properties that match your specific criteria before they hit
                the general market.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-100/50 bg-white p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
              <div className="absolute top-0 right-0 -mt-12 h-24 w-24 rounded-bl-full bg-gray-50 opacity-50" />
              <LeadCaptureForm type="listings" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
