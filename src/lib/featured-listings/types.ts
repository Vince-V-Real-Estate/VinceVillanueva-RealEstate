export const MAX_FEATURED_LISTINGS = 5;

export const FEATURED_LISTING_BASE_PATH = "/listing/featured";

export interface FeaturedListing {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedListingMutationInput {
  title: string;
  imageUrl: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
}

export type FeaturedListingUpdateInput = Partial<FeaturedListingMutationInput>;

export interface FeaturedListingsListResponse {
  listings: FeaturedListing[];
  maxFeaturedListings: number;
}

export interface FeaturedListingResponse {
  listing: FeaturedListing;
}

export function buildFeaturedListingPath(featuredId: string): string {
  return `${FEATURED_LISTING_BASE_PATH}/${featuredId}`;
}

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

export function formatFeaturedListingPrice(price: number): string {
  return currencyFormatter.format(price);
}

export function formatBathroomCount(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
