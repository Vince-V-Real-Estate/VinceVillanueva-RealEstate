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

function parseFeaturedListingId(rawId: string): string | null {
  const result = featuredListingIdSchema.safeParse(rawId);
  if (!result.success) {
    return null;
  }

  return result.data;
}

function getListingIdFromParams(params: Record<string, string>): string | null {
  const rawId = params.id;
  if (!rawId) {
    return null;
  }

  return parseFeaturedListingId(rawId);
}

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
