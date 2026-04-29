import {NextResponse} from "next/server";
import {z} from "zod";

import {createLogger} from "@/lib/logger";
import {deleteUploadThingFileByUrl, extractUploadThingFileKey} from "@/server/uploadthing/cleanup";
import {parseAndValidateBody, withApiHandler} from "@/utils/api/route-helpers";

const log = createLogger("api-uploadthing-cleanup");

const cleanupBodySchema = z.object({
	url: z.string().url(),
	reason: z.enum(["listing-image-replace", "presale-image-replace"]),
});

/**
 * POST /api/uploadthing-cleanup
 *
 * Admin-only endpoint that deletes a single UploadThing file by its public URL.
 * Used by the dashboard listing forms to clean up files that were uploaded but
 * then immediately undone/removed by the user before the listing was saved
 * (preventing orphan files in UploadThing storage).
 *
 * Server-side cleanup paths (PATCH/DELETE listing routes) handle
 * already-saved file replacements; this endpoint covers the unsaved-undo gap.
 */
export const POST = withApiHandler({endpoint: "/api/uploadthing-cleanup", method: "POST", requireAuth: true, requireRole: "admin"}, async (request) => {
	const result = await parseAndValidateBody(request, cleanupBodySchema);
	if ("error" in result) {
		return result.error;
	}

	const {url, reason} = result.data;

	const fileKey = extractUploadThingFileKey(url);
	if (!fileKey) {
		log.warn("Rejected cleanup request for non-UploadThing URL", {url, reason});
		return NextResponse.json({error: "Unsupported file URL"}, {status: 400});
	}

	await deleteUploadThingFileByUrl(url, {reason});

	return {data: {deleted: true}};
});
