import { and, eq, sql, type InferSelectModel } from "drizzle-orm";

import {
  MAX_FEATURED_LISTINGS,
  type FeaturedListing,
  type FeaturedListingMutationInput,
  type FeaturedListingUpdateInput,
} from "@/lib/featured-listings/types";
import { db } from "@/server/db";
import { featuredListing } from "@/server/db/schema";

/** Type alias for the Drizzle model row type */
type FeaturedListingRow = InferSelectModel<typeof featuredListing>;

/**
 * Converts a database row to a FeaturedListing API response object.
 * Handles conversion of Date objects to ISO date strings.
 * @param row - Raw database row from Drizzle
 * @returns FeaturedListing object with string timestamps
 */
function toFeaturedListing(row: FeaturedListingRow): FeaturedListing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    price: row.price,
    address: row.address,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    squareFeet: row.squareFeet,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

interface ListFeaturedListingsOptions {
  limit?: number;
  realtorId?: string;
}

/**
 * Retrieves featured listings from the database.
 * @param options - Optional filters: limit (max results) and realtorId (filter by owner)
 * @returns Array of featured listings ordered by creation date (newest first)
 */
export async function listFeaturedListings(
  options: ListFeaturedListingsOptions = {},
): Promise<FeaturedListing[]> {
  const rows = await db.query.featuredListing.findMany({
    where: options.realtorId
      ? eq(featuredListing.realtorId, options.realtorId)
      : undefined,
    orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    limit: options.limit,
  });

  return rows.map(toFeaturedListing);
}

/**
 * Retrieves a single featured listing by its unique ID.
 * @param id - The listing's unique identifier
 * @returns The featured listing, or null if not found
 */
export async function getFeaturedListingById(
  id: string,
): Promise<FeaturedListing | null> {
  const row = await db.query.featuredListing.findFirst({
    where: eq(featuredListing.id, id),
  });

  if (!row) {
    return null;
  }

  return toFeaturedListing(row);
}

/**
 * Counts the total number of featured listings owned by a specific realtor.
 * Used to enforce the maximum listings limit (5) before creation.
 * @param realtorId - The realtor's user ID
 * @returns Count of featured listings for this realtor
 */
export async function countFeaturedListingsForRealtor(
  realtorId: string,
): Promise<number> {
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(featuredListing)
    .where(eq(featuredListing.realtorId, realtorId));

  return Number(countResult[0]?.count ?? 0);
}

/**
 * Creates a new featured listing in the database.
 * Associates the listing with the given realtor's account.
 * @param realtorId - The ID of the realtor creating the listing
 * @param input - Listing data (title, imageUrl, price, address, bedrooms, bathrooms, squareFeet)
 * @returns The newly created listing with generated ID and timestamps
 * @throws Error if the insert operation fails to return a result
 */
export async function createFeaturedListingForRealtor(
  realtorId: string,
  input: FeaturedListingMutationInput,
): Promise<FeaturedListing> {
  const now = new Date();

  const [createdListing] = await db
    .insert(featuredListing)
    .values({
      ...input,
      realtorId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!createdListing) {
    throw new Error("Failed to create featured listing");
  }

  return toFeaturedListing(createdListing);
}

/**
 * Updates an existing featured listing, ensuring the caller owns the listing.
 * Returns the previous image URL if it was replaced, enabling cleanup.
 * @param id - The listing's unique identifier
 * @param realtorId - The ID of the realtor making the update (must own the listing)
 * @param input - Partial listing data to update
 * @returns Updated listing with previous image URL (if replaced), or null if not found/unauthorized
 */
export async function updateFeaturedListingForRealtor(
  id: string,
  realtorId: string,
  input: FeaturedListingUpdateInput,
): Promise<{
  listing: FeaturedListing;
  previousImageUrl: string | null;
} | null> {
  const listingOwnershipFilter = and(
    eq(featuredListing.id, id),
    eq(featuredListing.realtorId, realtorId),
  );

  return db.transaction(async (tx) => {
    const [lockedListing] = await tx
      .select()
      .from(featuredListing)
      .where(listingOwnershipFilter)
      .for("update");

    if (!lockedListing) {
      return null;
    }

    const [updatedListing] = await tx
      .update(featuredListing)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(listingOwnershipFilter)
      .returning();

    if (!updatedListing) {
      return null;
    }

    // Capture previous image URL under the same row lock to avoid stale cleanup targets.
    const previousImageUrl =
      input.imageUrl !== undefined && input.imageUrl !== lockedListing.imageUrl
        ? lockedListing.imageUrl
        : null;

    return {
      listing: toFeaturedListing(updatedListing),
      previousImageUrl,
    };
  });
}

/**
 * Deletes a featured listing from the database, verifying ownership.
 * Returns the deleted status and the associated image URL for cleanup.
 * @param id - The listing's unique identifier
 * @param realtorId - The ID of the realtor deleting the listing (must own it)
 * @returns Object with deleted status and the image URL (if any) for cleanup
 */
export async function deleteFeaturedListingForRealtor(
  id: string,
  realtorId: string,
): Promise<{ deleted: boolean; imageUrl: string | null }> {
  const deleted = await db
    .delete(featuredListing)
    .where(
      and(eq(featuredListing.id, id), eq(featuredListing.realtorId, realtorId)),
    )
    .returning({ id: featuredListing.id, imageUrl: featuredListing.imageUrl });

  const deletedRow = deleted[0];

  return {
    deleted: Boolean(deletedRow),
    imageUrl: deletedRow?.imageUrl ?? null,
  };
}

/**
 * Parses and validates the "limit" query parameter for listing endpoints.
 * @param limitParam - The raw string value from the URL query parameter
 * @returns Valid integer limit (1-5), or null if invalid/missing (defaults handled by caller)
 */
export function parseFeaturedListingsLimit(
  limitParam: string | null,
): number | null {
  if (limitParam === null) {
    return MAX_FEATURED_LISTINGS;
  }

  const parsedLimit = Number.parseInt(limitParam, 10);

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1 ||
    parsedLimit > MAX_FEATURED_LISTINGS
  ) {
    return null;
  }

  return parsedLimit;
}

/** Alias for parseFeaturedListingsLimit - may be used for consistency with other modules */
export const getFeaturedListingsLimit = parseFeaturedListingsLimit;
