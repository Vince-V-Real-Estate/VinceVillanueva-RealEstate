import {and, eq, sql, type InferSelectModel} from "drizzle-orm";

import {type PresaleListing, type PresaleListingMutationInput, type PresaleListingUpdateInput} from "@/lib/presales/types";
import {db} from "@/server/db";
import {presaleListing} from "@/server/db/schema";

/** Type alias for the Drizzle model row type */
type PresaleListingRow = InferSelectModel<typeof presaleListing>;

/** Advisory lock key used to serialize presale create-limit checks across requests. */
const PRESALE_CREATE_LIMIT_LOCK_KEY = 62_007;

/**
 * Converts a database row to a PresaleListing API response object.
 * Handles conversion of Date objects to ISO date strings.
 * @param row - Raw database row from Drizzle
 * @returns PresaleListing object with string timestamps
 */
function toPresaleListing(row: PresaleListingRow): PresaleListing {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		price: row.price,
		address: row.address,
		bedrooms: row.bedrooms,
		bathrooms: row.bathrooms,
		squareFeet: row.squareFeet,
		imageUrls: row.imageUrls,
		status: row.status,
		completion: row.completion,
		developer: row.developer,
		amenities: row.amenities,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

interface ListPresaleListingsOptions {
	limit?: number;
}

/**
 * Retrieves presale listings from the database, ordered by creation date (newest first).
 * @param options - Optional filters (e.g., limit)
 * @returns Array of presale listings
 */
export async function listPresaleListings(options: ListPresaleListingsOptions = {}): Promise<PresaleListing[]> {
	const rows = await db.query.presaleListing.findMany({
		orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
		limit: options.limit,
	});

	return rows.map(toPresaleListing);
}

/**
 * Retrieves a single presale listing by its unique ID.
 * @async
 * @param id - The listing's unique identifier
 * @returns The presale listing, or null if not found
 */
export async function getPresaleListingById(id: string): Promise<PresaleListing | null> {
	const row = await db.query.presaleListing.findFirst({
		where: eq(presaleListing.id, id),
	});

	if (!row) {
		return null;
	}

	return toPresaleListing(row);
}

/**
 * Creates a presale listing while atomically enforcing the global max-listings limit.
 * Uses a transaction-scoped advisory lock to prevent race conditions under concurrent
 * create requests.
 * @param realtorId - The ID of the admin creating the listing
 * @param input - Presale listing data
 * @param maxPresaleListings - Maximum allowed presale listings in the system
 * @returns The created listing, or null if the max limit has already been reached
 */
export async function createPresaleListingWithLimit(realtorId: string, input: PresaleListingMutationInput, maxPresaleListings: number): Promise<PresaleListing | null> {
	return db.transaction(async (tx) => {
		await tx.execute(sql`SELECT pg_advisory_xact_lock(${PRESALE_CREATE_LIMIT_LOCK_KEY})`);

		const countResult = await tx.select({count: sql<number>`count(*)`}).from(presaleListing);
		const currentCount = Number(countResult[0]?.count ?? 0);

		if (currentCount >= maxPresaleListings) {
			return null;
		}

		const now = new Date();
		const [createdListing] = await tx
			.insert(presaleListing)
			.values({
				...input,
				realtorId,
				createdAt: now,
				updatedAt: now,
			})
			.returning();

		if (!createdListing) {
			throw new Error("Failed to create presale listing");
		}

		return toPresaleListing(createdListing);
	});
}

/**
 * Updates an existing presale listing, ensuring the caller owns the listing.
 * Returns the previous image URLs if they were changed, enabling cleanup.
 * @async
 * @param id - The listing's unique identifier
 * @param realtorId - The ID of the admin making the update (must own the listing)
 * @param input - Partial listing data to update
 * @returns Updated listing with previous image URLs (if changed), or null if not found
 */
export async function updatePresaleListing(
	id: string,
	realtorId: string,
	input: PresaleListingUpdateInput,
): Promise<{
	listing: PresaleListing;
	removedImageUrls: string[];
} | null> {
	const listingOwnershipFilter = and(eq(presaleListing.id, id), eq(presaleListing.realtorId, realtorId));

	return db.transaction(async (tx) => {
		const [lockedListing] = await tx.select().from(presaleListing).where(listingOwnershipFilter).for("update");

		if (!lockedListing) {
			return null;
		}

		const [updatedListing] = await tx
			.update(presaleListing)
			.set({
				...input,
				updatedAt: new Date(),
			})
			.where(listingOwnershipFilter)
			.returning();

		if (!updatedListing) {
			return null;
		}

		// Determine which images were removed so the caller can clean them up
		let removedImageUrls: string[] = [];
		if (input.imageUrls !== undefined) {
			const newUrlSet = new Set(input.imageUrls);
			removedImageUrls = lockedListing.imageUrls.filter((url) => !newUrlSet.has(url));
		}

		return {
			listing: toPresaleListing(updatedListing),
			removedImageUrls,
		};
	});
}

/**
 * Deletes a presale listing from the database, verifying ownership.
 * Returns the deleted status and the associated image URLs for cleanup.
 * @async
 * @param id - The listing's unique identifier
 * @param realtorId - The ID of the admin deleting the listing (must own it)
 * @returns Object with deleted status and the image URLs for cleanup
 */
export async function deletePresaleListing(id: string, realtorId: string): Promise<{deleted: boolean; imageUrls: string[]}> {
	const deleted = await db
		.delete(presaleListing)
		.where(and(eq(presaleListing.id, id), eq(presaleListing.realtorId, realtorId)))
		.returning({id: presaleListing.id, imageUrls: presaleListing.imageUrls});

	const deletedRow = deleted[0];

	return {
		deleted: Boolean(deletedRow),
		imageUrls: deletedRow?.imageUrls ?? [],
	};
}
