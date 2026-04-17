import type {HeroImage, HeroImageResponse} from "@/lib/hero-image/types";
import type {HeroImageUpdateInput} from "@/lib/zod/hero-image";

/**
 * Custom error class for hero image API failures.
 */
export class HeroImageApiError extends Error {
	public readonly status: number;
	public readonly details?: Record<string, string>;

	constructor(message: string, status: number, details?: Record<string, string>) {
		super(message);
		this.name = "HeroImageApiError";
		this.status = status;
		this.details = details;
	}
}

const HERO_IMAGE_API_URL = "/api/hero-image";

interface ApiErrorShape {
	error?: string;
	details?: Record<string, string>;
}

/**
 * Extracts the hero image payload from either supported API response
 * envelope shape.
 * @param {HeroImageResponse} body - Parsed response payload.
 * @returns {HeroImage} Normalized hero image record.
 */
function unwrapHeroImage(body: HeroImageResponse): HeroImage {
	if ("heroImage" in body) {
		return body.heroImage;
	}

	return body.data.heroImage;
}

/**
 * Normalizes the JSON error body returned by the hero image API into a
 * flat user-facing message.
 * @param {ApiErrorShape | null} body - Parsed error body or null.
 * @returns {string} Message suitable for display.
 */
function getApiErrorMessage(body: ApiErrorShape | null): string {
	const fallback = body?.error ?? "Failed to perform hero image request";
	if (!body?.details) return fallback;
	const messages = Object.values(body.details).filter((value): value is string => Boolean(value));
	if (messages.length === 0) return fallback;
	return fallback === "Validation failed" ? messages.join(" ") : `${fallback} ${messages.join(" ")}`;
}

/**
 * Low-level fetch wrapper for the hero image endpoint. Throws
 * HeroImageApiError on non-2xx responses.
 * @param {RequestInit} [init] - Fetch init options.
 * @returns {Promise<HeroImageResponse>} Parsed response body.
 */
async function requestHeroImage(init?: RequestInit): Promise<HeroImageResponse> {
	const response = await fetch(HERO_IMAGE_API_URL, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...init?.headers,
		},
	});

	const text = await response.text();
	let body: (HeroImageResponse & ApiErrorShape) | null = null;
	if (text) {
		try {
			body = JSON.parse(text) as HeroImageResponse & ApiErrorShape;
		} catch {
			// Non-JSON body (e.g. HTML error page from a proxy/CDN). Surface a
			// clear error rather than letting JSON.parse crash execution.
			throw new HeroImageApiError("Invalid JSON response from server", response.status);
		}
	}

	if (!response.ok) {
		throw new HeroImageApiError(getApiErrorMessage(body), response.status, body?.details);
	}

	if (!body) {
		throw new HeroImageApiError("Empty API response", response.status);
	}

	return body;
}

/**
 * Fetches the currently configured hero image singleton.
 * @param {{signal?: AbortSignal}} [options] - Optional abort signal.
 * @returns {Promise<HeroImage>} Current hero image record.
 */
export async function fetchHeroImage(options: {signal?: AbortSignal} = {}): Promise<HeroImage> {
	const body = await requestHeroImage({method: "GET", signal: options.signal});
	return unwrapHeroImage(body);
}

/**
 * Updates the hero image singleton row. Admin-only.
 * @param {HeroImageUpdateInput} input - Variants to update.
 * @returns {Promise<HeroImage>} Updated hero image record.
 */
export async function updateHeroImage(input: HeroImageUpdateInput): Promise<HeroImage> {
	const body = await requestHeroImage({method: "PUT", body: JSON.stringify(input)});
	return unwrapHeroImage(body);
}
