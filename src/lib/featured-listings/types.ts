/** Maximum number of featured listings allowed per realtor */
export const MAX_FEATURED_LISTINGS = 5;

/** Base URL path for featured listing pages */
export const FEATURED_LISTING_BASE_PATH = "/listing/featured";

/**
 * Complete featured listing data returned from the API.
 * Contains all property details along with system-generated fields (id, timestamps).
 */
export interface FeaturedListing {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input type for creating a new featured listing.
 * All fields are required (no partial updates).
 */
export interface FeaturedListingMutationInput {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
}

/** Partial input type for updating an existing featured listing - all fields optional */
export type FeaturedListingUpdateInput = Partial<FeaturedListingMutationInput>;

/** Response shape for the list endpoint containing all featured listings */
export interface FeaturedListingsListResponse {
  listings: FeaturedListing[];
  maxFeaturedListings: number;
}

/** Response shape for single listing endpoints (GET by ID, POST, PATCH) */
export interface FeaturedListingResponse {
  listing: FeaturedListing;
}

/**
 * Builds the full URL path for a featured listing detail page.
 * @param featuredId - The unique identifier of the featured listing
 * @returns Full relative path (e.g., "/listing/featured/uuid")
 */
export function buildFeaturedListingPath(featuredId: string): string {
  return `${FEATURED_LISTING_BASE_PATH}/${featuredId}`;
}

/** Reusable currency formatter configured for Canadian Dollars (CAD) */
const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

/**
 * Formats a price number as a human-readable Canadian Dollar string.
 * @param price - Numeric price value
 * @returns Formatted string (e.g., "$450,000")
 */
export function formatFeaturedListingPrice(price: number): string {
  return currencyFormatter.format(price);
}

/**
 * Formats bathroom count for display, handling both whole and fractional numbers.
 * @param value - Bathroom count (e.g., 2 or 2.5)
 * @returns String representation ("2" or "2.5")
 */
export function formatBathroomCount(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
