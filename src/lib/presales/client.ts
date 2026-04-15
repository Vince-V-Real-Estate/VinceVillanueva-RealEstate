import {type PresaleListing, type PresaleListingMutationInput, type PresaleListingResponse, type PresaleListingsListResponse, type PresaleListingUpdateInput} from "@/lib/presales/types";

/**
 * Shape of error responses from the presales API.
 * May contain a top-level error message and/or field-level validation details.
 */
interface ApiErrorShape {
	error?: string;
	details?: Record<string, string>;
}

/**
 * Custom error class for API failures in the presales client.
 * Provides HTTP status code and validation error details for better error handling.
 */
export class PresalesApiError extends Error {
	public readonly status: number;
	public readonly details?: Record<string, string>;

	constructor(message: string, status: number, details?: Record<string, string>) {
		super(message);
		this.name = "PresalesApiError";
		this.status = status;
		this.details = details;
	}
}

/** Base API endpoint path for presale listings */
const PRESALES_API_BASE = "/api/presales";

/**
 * Extracts a user-friendly error message from an API error response body.
 * Combines the top-level error with field-level validation details when available.
 * @param body - The parsed JSON error response, or null if parsing failed
 * @returns A formatted error message string
 */
function getApiErrorMessage(body: ApiErrorShape | null): string {
	const fallbackMessage = body?.error ?? "Failed to perform presale listing request";
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
 * Low-level function for making authenticated API requests to the presales endpoint.
 * Handles JSON serialization, error response parsing, and throws PresalesApiError on failure.
 * @param path - The API endpoint path
 * @param init - Optional fetch RequestInit configuration
 * @returns The parsed response data
 */
async function requestPresalesApi<T>(path: string, init?: RequestInit): Promise<T> {
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
		throw new PresalesApiError(message, response.status, body?.details);
	}

	if (!body) {
		throw new PresalesApiError("Empty API response", response.status);
	}

	return body;
}

interface FetchPresaleListingsOptions {
	signal?: AbortSignal;
}

/**
 * Fetches all presale listings.
 * @param options - Optional configuration including abort signal
 * @returns Object with listings array and maxPresaleListings count
 */
export async function fetchPresaleListings(options: FetchPresaleListingsOptions = {}): Promise<{listings: PresaleListing[]; maxPresaleListings: number}> {
	const data = await requestPresalesApi<PresaleListingsListResponse>(PRESALES_API_BASE, {
		method: "GET",
		signal: options.signal,
	});

	return {listings: data.listings, maxPresaleListings: data.maxPresaleListings};
}

/**
 * Fetches a single presale listing by its unique ID.
 * @param id - The unique identifier of the presale listing
 * @param options - Optional configuration including abort signal
 * @returns The presale listing data
 * @throws PresalesApiError with status 404 if listing not found
 */
export async function fetchPresaleListing(id: string, options: {signal?: AbortSignal} = {}): Promise<PresaleListing> {
	const data = await requestPresalesApi<PresaleListingResponse>(`${PRESALES_API_BASE}/${id}`, {
		method: "GET",
		signal: options.signal,
	});

	return data.listing;
}

/**
 * Creates a new presale listing. Requires admin authentication.
 * @param input - The listing data to create
 * @returns The created presale listing with generated ID and timestamps
 * @throws PresalesApiError with status 400 if listing limit is reached
 */
export async function createPresaleListing(input: PresaleListingMutationInput): Promise<PresaleListing> {
	const data = await requestPresalesApi<PresaleListingResponse>(PRESALES_API_BASE, {
		method: "POST",
		body: JSON.stringify(input),
	});

	return data.listing;
}

/**
 * Updates an existing presale listing. Requires admin authentication.
 * The API handles cleanup of removed images from UploadThing automatically.
 * @param id - The unique identifier of the listing to update
 * @param input - Partial listing data to update
 * @returns The updated presale listing
 * @throws PresalesApiError with status 404 if listing not found
 */
export async function updatePresaleListing(id: string, input: PresaleListingUpdateInput): Promise<PresaleListing> {
	const data = await requestPresalesApi<PresaleListingResponse>(`${PRESALES_API_BASE}/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});

	return data.listing;
}

/**
 * Deletes a presale listing. Requires admin authentication.
 * The API handles cleanup of all associated images from UploadThing automatically.
 * @param id - The unique identifier of the listing to delete
 * @throws PresalesApiError with status 404 if listing not found
 */
export async function deletePresaleListing(id: string): Promise<void> {
	await requestPresalesApi<{success: true}>(`${PRESALES_API_BASE}/${id}`, {
		method: "DELETE",
	});
}
