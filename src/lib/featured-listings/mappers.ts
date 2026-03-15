import type { SlideData } from "@/components/ui/carousel";
import {
  buildFeaturedListingPath,
  formatFeaturedListingPrice,
  type FeaturedListing,
} from "@/lib/featured-listings/types";

export function mapFeaturedListingToCarouselSlide(
  listing: FeaturedListing,
): SlideData {
  return {
    id: listing.id,
    title: listing.title,
    src: listing.imageUrl,
    price: formatFeaturedListingPrice(listing.price),
    address: listing.address,
    specs: {
      beds: listing.bedrooms,
      baths: listing.bathrooms,
      sqft: listing.squareFeet,
    },
    href: buildFeaturedListingPath(listing.id),
  };
}
