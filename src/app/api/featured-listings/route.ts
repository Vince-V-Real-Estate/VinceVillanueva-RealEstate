import { NextResponse } from "next/server";

import { MAX_FEATURED_LISTINGS } from "@/lib/featured-listings/types";
import { featuredListingInputSchema } from "@/lib/zod/featured-listing";
import { createLogger } from "@/lib/logger";
import {
  countFeaturedListingsForRealtor,
  createFeaturedListingForRealtor,
  listFeaturedListings,
  parseFeaturedListingsLimit,
} from "@/server/featured-listings/service";
import { deleteUploadThingFileByUrl } from "@/server/uploadthing/cleanup";
import {
  parseAndValidateBody,
  withApiHandler,
} from "@/utils/api/route-helpers";

const log = createLogger("featured-listings-api");

/**
 * GET handler for listing all featured listings.
 * Public endpoint - no authentication required.
 * Supports optional "limit" query parameter (1-5, defaults to 5).
 * Returns listings ordered by creation date (newest first).
 */
export const GET = withApiHandler(
  {
    endpoint: "/api/featured-listings",
    method: "GET",
    requireAuth: false,
  },
  async (request) => {
    const requestUrl = new URL(request.url);
    const limitParam = requestUrl.searchParams.get("limit");
    const limit = parseFeaturedListingsLimit(limitParam);

    if (limit === null) {
      return NextResponse.json(
        {
          error: `Invalid limit. Use a value between 1 and ${MAX_FEATURED_LISTINGS}.`,
        },
        { status: 400 },
      );
    }

    const listings = await listFeaturedListings({ limit });

    return {
      data: {
        listings,
        maxFeaturedListings: MAX_FEATURED_LISTINGS,
      },
    };
  },
);

/**
 * POST handler for creating a new featured listing.
 * Requires admin role. Enforces maximum listing limit (5) per realtor.
 * Validates input against Zod schema before insertion.
 */
export const POST = withApiHandler(
  {
    endpoint: "/api/featured-listings",
    method: "POST",
    requireRole: "admin",
  },
  async (request, { session }) => {
    const result = await parseAndValidateBody(
      request,
      featuredListingInputSchema,
    );
    if ("error" in result) {
      return result.error;
    }

    const realtorId = session!.user.id;
    const currentCount = await countFeaturedListingsForRealtor(realtorId);
    if (currentCount >= MAX_FEATURED_LISTINGS) {
      return NextResponse.json(
        {
          error: `You can only feature up to ${MAX_FEATURED_LISTINGS} listings.`,
        },
        { status: 400 },
      );
    }

    let listing;

    try {
      listing = await createFeaturedListingForRealtor(realtorId, result.data);
    } catch (error) {
      await deleteUploadThingFileByUrl(result.data.imageUrl, {
        reason: "listing-create-failure",
        realtorId,
      });

      log.error(
        "Featured listing create failed; image cleanup attempted",
        error,
        {
          realtorId,
        },
      );

      throw error;
    }

    log.info("Featured listing created", {
      listingId: listing.id,
      realtorId,
    });

    return {
      data: { listing },
      status: 201,
    };
  },
);
