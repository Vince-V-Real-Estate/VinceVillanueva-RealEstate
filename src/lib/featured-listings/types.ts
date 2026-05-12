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
