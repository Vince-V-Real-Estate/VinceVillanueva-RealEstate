"use client";

import { LeadCaptureForm } from "@/components/forms/lead-capture";
import Carousel, { type SlideData } from "@/components/ui/carousel";

const FEATURED_LISTINGS: SlideData[] = [
  {
    title: "Modern Waterfront Estate",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2940&auto=format&fit=crop",
    price: "$4,250,000",
    address: "1234 Ocean Dr, Vancouver, BC",
    specs: { beds: 5, baths: 4, sqft: 4200 },
  },
  {
    title: "Downtown Penthouse",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop",
    price: "$2,800,000",
    address: "567 Skyline Ave, Vancouver, BC",
    specs: { beds: 3, baths: 3, sqft: 2100 },
  },
  {
    title: "Luxury West Van Home",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1600596542815-22b5dbf1529e?q=80&w=2938&auto=format&fit=crop",
    price: "$5,900,000",
    address: "890 Marine Dr, West Vancouver, BC",
    specs: { beds: 6, baths: 7, sqft: 5500 },
  },
  {
    title: "Modern Family Home",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop",
    price: "$1,950,000",
    address: "321 Oak St, Burnaby, BC",
    specs: { beds: 4, baths: 3, sqft: 2800 },
  },
  {
    title: "Architectural Masterpiece",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2953&auto=format&fit=crop",
    price: "$3,500,000",
    address: "456 Cedar Ln, North Vancouver, BC",
    specs: { beds: 4, baths: 4, sqft: 3600 },
  },
];

export function ListingsCTA() {
  return (
    <section className="w-full overflow-hidden bg-zinc-50 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-0">
          <div className="m-auto w-full">
            <h2 className="text-center text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Featured Listings
            </h2>
            <div className="relative flex w-full items-center justify-center py-10 xl:mx-auto xl:w-full">
              {/* Carousel replacing the #LuxuryListing image */}
              <Carousel slides={FEATURED_LISTINGS} />
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
