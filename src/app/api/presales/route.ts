import {NextResponse} from "next/server";

import {MAX_PRESALE_LISTINGS} from "@/lib/presales/types";
import {presaleInputSchema} from "@/lib/zod/presale";
import {createLogger} from "@/lib/logger";
import {countPresaleListings, createPresaleListing, listPresaleListings} from "@/server/presales/service";
import {deleteUploadThingFileByUrl} from "@/server/uploadthing/cleanup";
import {parseAndValidateBody, withApiHandler} from "@/utils/api/route-helpers";

const log = createLogger("presales-api");

/**
 * GET handler for listing all presale listings.
 * Public endpoint - no authentication required.
 * Returns listings ordered by creation date (newest first).
 */
export const GET = withApiHandler(
	{
		endpoint: "/api/presales",
		method: "GET",
		requireAuth: false,
	},
	async () => {
		const listings = await listPresaleListings();

		return {
			data: {
				listings,
				maxPresaleListings: MAX_PRESALE_LISTINGS,
			},
		};
	},
);

/**
 * POST handler for creating a new presale listing.
 * Requires admin role. Enforces maximum listing limit per the system.
 * Validates input against Zod schema before insertion.
 * Neon (DB) and UploadThing operations are independent - image cleanup
 * is attempted on DB failure but does not affect the error response.
 */
export const POST = withApiHandler(
	{
		endpoint: "/api/presales",
		method: "POST",
		requireRole: "admin",
	},
	async (request, {session}) => {
		const result = await parseAndValidateBody(request, presaleInputSchema);
		if ("error" in result) {
			return result.error;
		}

		const currentCount = await countPresaleListings();
		if (currentCount >= MAX_PRESALE_LISTINGS) {
			return NextResponse.json(
				{
					error: `Maximum of ${MAX_PRESALE_LISTINGS} presale listings allowed.`,
				},
				{status: 400},
			);
		}

		const realtorId = session!.user.id;
		let listing;

		try {
			listing = await createPresaleListing(realtorId, result.data);
		} catch (error) {
			// Attempt to clean up uploaded images independently of DB failure
			for (const imageUrl of result.data.imageUrls) {
				await deleteUploadThingFileByUrl(imageUrl, {
					reason: "presale-create-failure",
					realtorId,
				});
			}

			log.error("Presale listing create failed; image cleanup attempted", error, {
				realtorId,
			});

			throw error;
		}

		log.info("Presale listing created", {
			listingId: listing.id,
			realtorId,
		});

		return {
			data: {listing},
			status: 201,
		};
	},
);
