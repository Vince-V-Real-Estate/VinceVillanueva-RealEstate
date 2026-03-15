import { and, eq, sql, type InferSelectModel } from "drizzle-orm";

import {
  MAX_FEATURED_LISTINGS,
  type FeaturedListing,
  type FeaturedListingMutationInput,
  type FeaturedListingUpdateInput,
} from "@/lib/featured-listings/types";
import { db } from "@/server/db";
import { featuredListing } from "@/server/db/schema";

type FeaturedListingRow = InferSelectModel<typeof featuredListing>;

function toFeaturedListing(row: FeaturedListingRow): FeaturedListing {
  return {
    id: row.id,
    title: row.title,
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

export async function countFeaturedListingsForRealtor(
  realtorId: string,
): Promise<number> {
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(featuredListing)
    .where(eq(featuredListing.realtorId, realtorId));

  return Number(countResult[0]?.count ?? 0);
}

export async function createFeaturedListingForRealtor(
  realtorId: string,
  input: FeaturedListingMutationInput,
): Promise<FeaturedListing> {
  const [createdListing] = await db
    .insert(featuredListing)
    .values({
      ...input,
      realtorId,
    })
    .returning();

  if (!createdListing) {
    throw new Error("Failed to create featured listing");
  }

  return toFeaturedListing(createdListing);
}

export async function updateFeaturedListingForRealtor(
  id: string,
  realtorId: string,
  input: FeaturedListingUpdateInput,
): Promise<{
  listing: FeaturedListing;
  previousImageUrl: string | null;
} | null> {
  const existingListing = await db.query.featuredListing.findFirst({
    where: and(
      eq(featuredListing.id, id),
      eq(featuredListing.realtorId, realtorId),
    ),
  });

  if (!existingListing) {
    return null;
  }

  const [updatedListing] = await db
    .update(featuredListing)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(
      and(eq(featuredListing.id, id), eq(featuredListing.realtorId, realtorId)),
    )
    .returning();

  if (!updatedListing) {
    return null;
  }

  const previousImageUrl =
    input.imageUrl !== undefined && input.imageUrl !== existingListing.imageUrl
      ? existingListing.imageUrl
      : null;

  return {
    listing: toFeaturedListing(updatedListing),
    previousImageUrl,
  };
}

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

export const getFeaturedListingsLimit = parseFeaturedListingsLimit;
