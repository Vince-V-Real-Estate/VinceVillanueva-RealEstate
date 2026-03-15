import { NextResponse } from "next/server";

import {
  featuredListingIdSchema,
  updateFeaturedListingInputSchema,
} from "@/lib/zod/featured-listing";
import { createLogger } from "@/lib/logger";
import {
  deleteFeaturedListingForRealtor,
  getFeaturedListingById,
  updateFeaturedListingForRealtor,
} from "@/server/featured-listings/service";
import { deleteUploadThingFileByUrl } from "@/server/uploadthing/cleanup";
import {
  parseAndValidateBody,
  withApiHandler,
} from "@/utils/api/route-helpers";

const log = createLogger("featured-listings-api");

/**
 * Validates and parses a featured listing ID from a raw string.
 * Uses Zod schema to ensure the ID matches the expected format (UUID).
 * @param rawId - The raw ID string from the URL parameter
 * @returns The validated ID string, or null if validation fails
 */
function parseFeaturedListingId(rawId: string): string | null {
  const result = featuredListingIdSchema.safeParse(rawId);
  if (!result.success) {
    return null;
  }

  return result.data;
}

/**
 * Extracts and validates the featured listing ID from the URL parameters.
 * @param params - The Next.js route parameters object
 * @returns The validated listing ID, or null if missing or invalid
 */
function getListingIdFromParams(params: Record<string, string>): string | null {
  const rawId = params.id;
  if (!rawId) {
    return null;
  }

  return parseFeaturedListingId(rawId);
}

/**
 * GET handler for fetching a single featured listing by ID.
 * Public endpoint - no authentication required.
 * Returns the listing details or 404 if not found.
 */
export const GET = withApiHandler(
  {
    endpoint: "/api/featured-listings/[id]",
    method: "GET",
    requireAuth: false,
  },
  async (_request, { params }) => {
    const listingId = getListingIdFromParams(params);
    if (!listingId) {
      return NextResponse.json(
        { error: "Invalid featured listing id" },
        { status: 400 },
      );
    }

    const listing = await getFeaturedListingById(listingId);
    if (!listing) {
      return NextResponse.json(
        { error: "Featured listing not found" },
        { status: 404 },
      );
    }

    return { data: { listing } };
  },
);

/**
 * PATCH handler for updating a featured listing.
 * Requires admin role. Validates input, updates the listing in the database,
 * and cleans up the previous image file if a new one was uploaded.
 */
export const PATCH = withApiHandler(
  {
    endpoint: "/api/featured-listings/[id]",
    method: "PATCH",
    requireRole: "admin",
  },
  async (request, { params, session }) => {
    const listingId = getListingIdFromParams(params);
    if (!listingId) {
      return NextResponse.json(
        { error: "Invalid featured listing id" },
        { status: 400 },
      );
    }

    const result = await parseAndValidateBody(
      request,
      updateFeaturedListingInputSchema,
    );
    if ("error" in result) {
      return result.error;
    }

    const realtorId = session!.user.id;
    const updateResult = await updateFeaturedListingForRealtor(
      listingId,
      realtorId,
      result.data,
    );

    if (!updateResult) {
      return NextResponse.json(
        { error: "Featured listing not found" },
        { status: 404 },
      );
    }

    // Clean up old image if a new one was uploaded to replace it
    if (updateResult.previousImageUrl) {
      await deleteUploadThingFileByUrl(updateResult.previousImageUrl, {
        reason: "listing-image-replace",
        listingId,
      });
    }

    log.info("Featured listing updated", {
      listingId,
      realtorId,
    });

    return { data: { listing: updateResult.listing } };
  },
);

/**
 * DELETE handler for removing a featured listing.
 * Requires admin role. Deletes the listing from the database and
 * removes the associated image file from UploadThing storage.
 */
export const DELETE = withApiHandler(
  {
    endpoint: "/api/featured-listings/[id]",
    method: "DELETE",
    requireRole: "admin",
  },
  async (_request, { params, session }) => {
    const listingId = getListingIdFromParams(params);
    if (!listingId) {
      return NextResponse.json(
        { error: "Invalid featured listing id" },
        { status: 400 },
      );
    }

    const realtorId = session!.user.id;
    const deleteResult = await deleteFeaturedListingForRealtor(
      listingId,
      realtorId,
    );
    if (!deleteResult.deleted) {
      return NextResponse.json(
        { error: "Featured listing not found" },
        { status: 404 },
      );
    }

    // Clean up the image file from UploadThing when listing is deleted
    if (deleteResult.imageUrl) {
      await deleteUploadThingFileByUrl(deleteResult.imageUrl, {
        reason: "listing-delete",
        listingId,
      });
    }

    log.info("Featured listing deleted", {
      listingId,
      realtorId,
    });

    return { data: { success: true } };
  },
);
