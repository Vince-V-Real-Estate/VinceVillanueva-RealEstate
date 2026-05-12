import {ApiError, createApiClient} from "@/lib/api/client";
import {type PresaleListing, type PresaleListingMutationInput, type PresaleListingResponse, type PresaleListingsListResponse, type PresaleListingUpdateInput} from "@/lib/presales/types";

/**
 * Custom error class for API failures in the presales client.
 * Extends `ApiError` so callers can keep using `instanceof PresalesApiError`.
 */
export class PresalesApiError extends ApiError {
	constructor(message: string, status: number, details?: Record<string, string>) {
		super(message, status, details);
		this.name = "PresalesApiError";
	}
}

/** Base API endpoint path for presale listings */
const PRESALES_API_BASE = "/api/presales";

const {request} = createApiClient({
	ErrorClass: PresalesApiError,
	fallbackMessage: "Failed to perform presale listing request",
});

interface FetchPresaleListingsOptions {
	signal?: AbortSignal;
}

/**
 * Fetches all presale listings.
 * @param options Optional configuration including abort signal.
 * @returns Object with listings array and maxPresaleListings count.
 */
export async function fetchPresaleListings(options: FetchPresaleListingsOptions = {}): Promise<{listings: PresaleListing[]; maxPresaleListings: number}> {
	const data = await request<PresaleListingsListResponse>(PRESALES_API_BASE, {
		method: "GET",
		signal: options.signal,
	});

	return {listings: data.listings, maxPresaleListings: data.maxPresaleListings};
}

/**
 * Creates a new presale listing. Requires admin authentication.
 * @param input The listing data to create.
 * @returns The created presale listing with generated ID and timestamps.
 * @throws PresalesApiError with status 400 if listing limit is reached.
 */
export async function createPresaleListing(input: PresaleListingMutationInput): Promise<PresaleListing> {
	const data = await request<PresaleListingResponse>(PRESALES_API_BASE, {
		method: "POST",
		body: JSON.stringify(input),
	});

	return data.listing;
}

/**
 * Updates an existing presale listing. Requires admin authentication.
 * The API handles cleanup of removed images from UploadThing automatically.
 * @param id The unique identifier of the listing to update.
 * @param input Partial listing data to update.
 * @returns The updated presale listing.
 * @throws PresalesApiError with status 404 if listing not found.
 */
export async function updatePresaleListing(id: string, input: PresaleListingUpdateInput): Promise<PresaleListing> {
	const data = await request<PresaleListingResponse>(`${PRESALES_API_BASE}/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});

	return data.listing;
}

/**
 * Deletes a presale listing. Requires admin authentication.
 * The API handles cleanup of all associated images from UploadThing automatically.
 * @param id The unique identifier of the listing to delete.
 * @throws PresalesApiError with status 404 if listing not found.
 */
export async function deletePresaleListing(id: string): Promise<void> {
	await request<{success: true}>(`${PRESALES_API_BASE}/${id}`, {
		method: "DELETE",
	});
}
