import {NextResponse} from "next/server";
import {z} from "zod";

import {presaleIdSchema, updatePresaleInputSchema} from "@/lib/zod/presale";
import {createLogger} from "@/lib/logger";
import {deletePresaleListing, getPresaleListingById, updatePresaleListing} from "@/server/presales/service";
import {deleteUploadThingFileByUrl} from "@/server/uploadthing/cleanup";
import {parseAndValidateBody, withApiHandler} from "@/utils/api/route-helpers";

const log = createLogger("presales-api");

const presaleParamsSchema = z.object({
	id: presaleIdSchema,
});

/**
 * GET handler for fetching a single presale listing by ID.
 * Public endpoint - no authentication required.
 * Returns the listing details or 404 if not found.
 */
export const GET = withApiHandler(
	{
		endpoint: "/api/presales/[id]",
		method: "GET",
		requireAuth: false,
		paramsSchema: presaleParamsSchema,
	},
	async (_request, {resourceIds}) => {
		const listingId = resourceIds.id;

		const listing = await getPresaleListingById(listingId);
		if (!listing) {
			return NextResponse.json({error: "Presale listing not found"}, {status: 404});
		}

		return {data: {listing}};
	},
);

/**
 * PATCH handler for updating a presale listing.
 * Requires admin role. Validates input, updates the listing in the database,
 * and cleans up any removed image files from UploadThing independently.
 */
export const PATCH = withApiHandler(
	{
		endpoint: "/api/presales/[id]",
		method: "PATCH",
		requireRole: "admin",
		paramsSchema: presaleParamsSchema,
	},
	async (request, {resourceIds, session}) => {
		const listingId = resourceIds.id;

		const result = await parseAndValidateBody(request, updatePresaleInputSchema);
		if ("error" in result) {
			return result.error;
		}

		const realtorId = session!.user.id;
		const updateResult = await updatePresaleListing(listingId, realtorId, result.data);

		if (!updateResult) {
			return NextResponse.json({error: "Presale listing not found"}, {status: 404});
		}

		// Clean up removed images independently of the DB update
		for (const removedUrl of updateResult.removedImageUrls) {
			await deleteUploadThingFileByUrl(removedUrl, {
				reason: "presale-image-replace",
				listingId,
			});
		}

		log.info("Presale listing updated", {
			listingId,
			realtorId,
			removedImages: updateResult.removedImageUrls.length,
		});

		return {data: {listing: updateResult.listing}};
	},
);

/**
 * DELETE handler for removing a presale listing.
 * Requires admin role. Deletes the listing from the database and
 * removes all associated image files from UploadThing storage independently.
 */
export const DELETE = withApiHandler(
	{
		endpoint: "/api/presales/[id]",
		method: "DELETE",
		requireRole: "admin",
		paramsSchema: presaleParamsSchema,
	},
	async (_request, {resourceIds, session}) => {
		const listingId = resourceIds.id;

		const realtorId = session!.user.id;
		const deleteResult = await deletePresaleListing(listingId, realtorId);
		if (!deleteResult.deleted) {
			return NextResponse.json({error: "Presale listing not found"}, {status: 404});
		}

		// Clean up all image files from UploadThing independently
		for (const imageUrl of deleteResult.imageUrls) {
			await deleteUploadThingFileByUrl(imageUrl, {
				reason: "presale-delete",
				listingId,
			});
		}

		log.info("Presale listing deleted", {
			listingId,
			realtorId,
			cleanedUpImages: deleteResult.imageUrls.length,
		});

		return {data: {success: true}};
	},
);
