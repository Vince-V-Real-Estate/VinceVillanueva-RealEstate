import {createLogger} from "@/lib/logger";
import {heroImageUpdateSchema} from "@/lib/zod/hero-image";
import {getHeroImage, upsertHeroImage} from "@/server/hero-image/service";
import {deleteUploadThingFileByUrl} from "@/server/uploadthing/cleanup";
import {parseAndValidateBody, withApiHandler} from "@/utils/api/route-helpers";

const log = createLogger("hero-image-api");

/**
 * GET /api/hero-image — public. Returns the currently configured hero
 * image singleton. When the row does not exist yet, returns an object
 * with a null URL so the client falls back to the bundled defaults.
 */
export const GET = withApiHandler(
	{
		endpoint: "/api/hero-image",
		method: "GET",
		requireAuth: false,
	},
	async () => {
		const heroImage = await getHeroImage();
		return {data: {heroImage}};
	},
);

/**
 * PUT /api/hero-image — admin-only. Upserts the hero image singleton
 * row and removes the replaced image from UploadThing storage.
 */
export const PUT = withApiHandler(
	{
		endpoint: "/api/hero-image",
		method: "PUT",
		requireRole: "admin",
	},
	async (request, {session}) => {
		const result = await parseAndValidateBody(request, heroImageUpdateSchema);
		if ("error" in result) {
			return result.error;
		}

		const adminId = session!.user.id;
		const {previous, next} = await upsertHeroImage(result.data, adminId);

		if (previous.imageUrl && previous.imageUrl !== next.imageUrl) {
			await deleteUploadThingFileByUrl(previous.imageUrl, {
				reason: "hero-image-replace",
				realtorId: adminId,
			});
		}

		log.info("Hero image updated", {adminId});

		return {data: {heroImage: next}};
	},
);
