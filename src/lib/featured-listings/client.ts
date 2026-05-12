import {ApiError, createApiClient} from "@/lib/api/client";
import {MAX_FEATURED_LISTINGS, type FeaturedListing, type FeaturedListingMutationInput, type FeaturedListingResponse, type FeaturedListingsListResponse, type FeaturedListingUpdateInput} from "@/lib/featured-listings/types";

/**
 * Custom error class for API failures in the featured listings client.
 * Extends `ApiError` to expose the same `status`/`details` shape, while
 * preserving `instanceof FeaturedListingsApiError` checks at call sites.
 */
export class FeaturedListingsApiError extends ApiError {
	constructor(message: string, status: number, details?: Record<string, string>) {
		super(message, status, details);
		this.name = "FeaturedListingsApiError";
	}
}

/** Base API endpoint path for featured listings */
const FEATURED_LISTINGS_API_BASE = "/api/featured-listings";

const {request} = createApiClient({
	ErrorClass: FeaturedListingsApiError,
	fallbackMessage: "Failed to perform featured listing request",
});

interface FetchFeaturedListingsOptions {
	limit?: number;
	signal?: AbortSignal;
}

/**
 * Fetches all featured listings, optionally limited to a specific count.
 * @param options Optional configuration: limit (1-5, defaults to MAX_FEATURED_LISTINGS) and abort signal.
 * @returns Array of featured listings ordered by creation date (newest first).
 */
export async function fetchFeaturedListings(options: FetchFeaturedListingsOptions = {}): Promise<FeaturedListing[]> {
	const limit = options.limit ?? MAX_FEATURED_LISTINGS;
	const query = new URLSearchParams({limit: `${limit}`});
	const data = await request<FeaturedListingsListResponse>(`${FEATURED_LISTINGS_API_BASE}?${query.toString()}`, {
		method: "GET",
		signal: options.signal,
	});

	return data.listings;
}

/**
 * Creates a new featured listing. Requires admin authentication.
 * @param input The listing data (title, imageUrl, price, address, bedrooms, bathrooms, squareFeet).
 * @returns The created featured listing with generated ID and timestamps.
 * @throws FeaturedListingsApiError with status 400 if limit (5) is reached.
 */
export async function createFeaturedListing(input: FeaturedListingMutationInput): Promise<FeaturedListing> {
	const data = await request<FeaturedListingResponse>(FEATURED_LISTINGS_API_BASE, {
		method: "POST",
		body: JSON.stringify(input),
	});

	return data.listing;
}

/**
 * Updates an existing featured listing. Requires admin authentication.
 * @param id The unique identifier of the listing to update.
 * @param input Partial listing data to update (all fields optional).
 * @returns The updated featured listing with new timestamps.
 * @throws FeaturedListingsApiError with status 404 if listing not found.
 */
export async function updateFeaturedListing(id: string, input: FeaturedListingUpdateInput): Promise<FeaturedListing> {
	const data = await request<FeaturedListingResponse>(`${FEATURED_LISTINGS_API_BASE}/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});

	return data.listing;
}

/**
 * Deletes a featured listing. Requires admin authentication.
 * Also removes the associated image from UploadThing storage.
 * @param id The unique identifier of the listing to delete.
 * @throws FeaturedListingsApiError with status 404 if listing not found.
 */
export async function deleteFeaturedListing(id: string): Promise<void> {
	await request<{success: true}>(`${FEATURED_LISTINGS_API_BASE}/${id}`, {
		method: "DELETE",
	});
}
