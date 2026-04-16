/**
 * Maximum number of presale listings allowed in the system.
 * Enforced at the API level during creation.
 */
export const MAX_PRESALE_LISTINGS = 5;

/**
 * Maximum number of images allowed per presale listing.
 * ────────────────────────────────────────────────────────
 * To change this limit, update this constant. It is referenced by:
 *  - Zod validation schema  (src/lib/zod/presale.ts)
 *  - UploadThing route      (src/app/api/uploadthing/core.ts)
 *  - Presale service layer  (src/server/presales/service.ts)
 * ────────────────────────────────────────────────────────
 */
export const MAX_PRESALE_IMAGES = 3;

/** Base URL path for presale listing pages */
export const PRESALE_BASE_PATH = "/presale";

/**
 * Complete presale listing data returned from the API.
 * Contains all property details along with system-generated fields.
 */
export interface PresaleListing {
	id: string;
	title: string;
	description: string;
	price: number;
	address: string;
	bedrooms: number;
	bathrooms: number;
	squareFeet: number;
	imageUrls: string[];
	status: string | null;
	completion: string;
	developer: string;
	amenities: string[];
	createdAt: string;
	updatedAt: string;
}

/**
 * Input type for creating a new presale listing.
 * All fields are required (no partial updates).
 */
export interface PresaleListingMutationInput {
	title: string;
	description: string;
	price: number;
	address: string;
	bedrooms: number;
	bathrooms: number;
	squareFeet: number;
	imageUrls: string[];
	status?: string | null;
	completion: string;
	developer: string;
	amenities: string[];
}

/** Partial input type for updating an existing presale listing */
export type PresaleListingUpdateInput = Partial<PresaleListingMutationInput>;

/** Response shape for the list endpoint containing all presale listings */
export interface PresaleListingsListResponse {
	listings: PresaleListing[];
	maxPresaleListings: number;
}

/** Response shape for single presale listing endpoints (GET by ID, POST, PATCH) */
export interface PresaleListingResponse {
	listing: PresaleListing;
}

/**
 * Builds the full URL path for a presale listing detail page.
 * @param presaleId - The unique identifier of the presale listing
 * @returns Full relative path (e.g., "/presale/uuid")
 */
export function buildPresaleListingPath(presaleId: string): string {
	return `${PRESALE_BASE_PATH}/${presaleId}`;
}
