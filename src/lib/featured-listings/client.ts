import {MAX_FEATURED_LISTINGS, type FeaturedListing, type FeaturedListingMutationInput, type FeaturedListingResponse, type FeaturedListingsListResponse, type FeaturedListingUpdateInput} from "@/lib/featured-listings/types";

/**
 * Shape of error responses from the featured listings API.
 * May contain a top-level error message and/or field-level validation details.
 */
interface ApiErrorShape {
	error?: string;
	details?: Record<string, string>;
}

/**
 * Custom error class for API failures in the featured listings client.
 * Provides HTTP status code and validation error details for better error handling.
 */
export class FeaturedListingsApiError extends Error {
	public readonly status: number;
	public readonly details?: Record<string, string>;

	constructor(message: string, status: number, details?: Record<string, string>) {
		super(message);
		this.name = "FeaturedListingsApiError";
		this.status = status;
		this.details = details;
	}
}

/** Base API endpoint path for featured listings */
const FEATURED_LISTINGS_API_BASE = "/api/featured-listings";

/**
 * Extracts a user-friendly error message from an API error response body.
 * Combines the top-level error with field-level validation details when available.
 * @param body - The parsed JSON error response, or null if parsing failed
 * @returns A formatted error message string
 */
function getApiErrorMessage(body: ApiErrorShape | null): string {
	const fallbackMessage = body?.error ?? "Failed to perform featured listing request";
	if (!body?.details) {
		return fallbackMessage;
	}

	const detailMessages = Object.values(body.details).filter((value): value is string => Boolean(value));
	if (detailMessages.length === 0) {
		return fallbackMessage;
	}

	const detailsMessage = detailMessages.join(" ");
	if (fallbackMessage === "Validation failed") {
		return detailsMessage;
	}

	return `${fallbackMessage} ${detailsMessage}`;
}

/**
 * Parses the JSON body from a fetch Response.
 * Returns null for empty responses to distinguish between "no body" and "empty object".
 * @param response - The fetch Response object
 * @returns Parsed JSON data or null if response body is empty
 */
async function parseJsonResponse<T>(response: Response): Promise<T | null> {
	const text = await response.text();
	if (!text) {
		return null;
	}

	return JSON.parse(text) as T;
}

/**
 * Low-level function for making authenticated API requests to the featured listings endpoint.
 * Handles JSON serialization, error response parsing, and throws FeaturedListingsApiError on failure.
 * @param path - The API endpoint path (relative to FEATURED_LISTINGS_API_BASE or absolute)
 * @param init - Optional fetch RequestInit configuration
 * @returns The parsed response data
 */
async function requestFeaturedListingsApi<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(path, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...init?.headers,
		},
	});

	const body = await parseJsonResponse<T & ApiErrorShape>(response);

	if (!response.ok) {
		const message = getApiErrorMessage(body);
		throw new FeaturedListingsApiError(message, response.status, body?.details);
	}

	if (!body) {
		throw new FeaturedListingsApiError("Empty API response", response.status);
	}

	return body;
}

interface FetchFeaturedListingsOptions {
	limit?: number;
	signal?: AbortSignal;
}

/**
 * Fetches all featured listings, optionally limited to a specific count.
 * @param options - Optional configuration: limit (1-5, defaults to MAX_FEATURED_LISTINGS) and abort signal
 * @returns Array of featured listings ordered by creation date (newest first)
 */
export async function fetchFeaturedListings(options: FetchFeaturedListingsOptions = {}): Promise<FeaturedListing[]> {
	const limit = options.limit ?? MAX_FEATURED_LISTINGS;
	const query = new URLSearchParams({limit: `${limit}`});
	const data = await requestFeaturedListingsApi<FeaturedListingsListResponse>(`${FEATURED_LISTINGS_API_BASE}?${query.toString()}`, {
		method: "GET",
		signal: options.signal,
	});

	return data.listings;
}

/**
 * Fetches a single featured listing by its unique ID.
 * @param id - The unique identifier of the featured listing
 * @param options - Optional configuration including abort signal
 * @returns The featured listing data
 * @throws FeaturedListingsApiError with status 404 if listing not found
 */
export async function fetchFeaturedListing(id: string, options: {signal?: AbortSignal} = {}): Promise<FeaturedListing> {
	const data = await requestFeaturedListingsApi<FeaturedListingResponse>(`${FEATURED_LISTINGS_API_BASE}/${id}`, {
		method: "GET",
		signal: options.signal,
	});

	return data.listing;
}

/**
 * Creates a new featured listing. Requires admin authentication.
 * @param input - The listing data (title, imageUrl, price, address, bedrooms, bathrooms, squareFeet)
 * @returns The created featured listing with generated ID and timestamps
 * @throws FeaturedListingsApiError with status 400 if limit (5) is reached
 */
export async function createFeaturedListing(input: FeaturedListingMutationInput): Promise<FeaturedListing> {
	const data = await requestFeaturedListingsApi<FeaturedListingResponse>(FEATURED_LISTINGS_API_BASE, {
		method: "POST",
		body: JSON.stringify(input),
	});

	return data.listing;
}

/**
 * Updates an existing featured listing. Requires admin authentication.
 * @param id - The unique identifier of the listing to update
 * @param input - Partial listing data to update (all fields optional)
 * @returns The updated featured listing with new timestamps
 * @throws FeaturedListingsApiError with status 404 if listing not found
 */
export async function updateFeaturedListing(id: string, input: FeaturedListingUpdateInput): Promise<FeaturedListing> {
	const data = await requestFeaturedListingsApi<FeaturedListingResponse>(`${FEATURED_LISTINGS_API_BASE}/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});

	return data.listing;
}

/**
 * Deletes a featured listing. Requires admin authentication.
 * Also removes the associated image from UploadThing storage.
 * @param id - The unique identifier of the listing to delete
 * @throws FeaturedListingsApiError with status 404 if listing not found
 */
export async function deleteFeaturedListing(id: string): Promise<void> {
	await requestFeaturedListingsApi<{success: true}>(`${FEATURED_LISTINGS_API_BASE}/${id}`, {
		method: "DELETE",
	});
}
