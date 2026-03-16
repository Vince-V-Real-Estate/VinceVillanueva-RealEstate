import type { SlideData } from "@/components/ui/carousel";
import {
  buildFeaturedListingPath,
  formatFeaturedListingPrice,
  type FeaturedListing,
} from "@/lib/featured-listings/types";

/**
 * Converts a FeaturedListing domain object into a SlideData object for use in the homepage carousel.
 * Handles formatting of price and building of the detail page URL.
 * @param listing - The featured listing data from the API/database
 * @returns SlideData formatted for the carousel component
 */
export function mapFeaturedListingToCarouselSlide(
  listing: FeaturedListing,
): SlideData {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
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
