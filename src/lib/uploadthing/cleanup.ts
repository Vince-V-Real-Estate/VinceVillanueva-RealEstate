import {createLogger} from "@/lib/logger";

const log = createLogger("uploadthing-client-cleanup");

/** Reason codes accepted by the `/api/uploadthing-cleanup` endpoint. */
export type UploadThingClientCleanupReason = "listing-image-replace" | "presale-image-replace";

/**
 * Requests deletion of a single UploadThing file from a client component.
 *
 * Used by listing edit forms to clean up replacement files that the user
 * uploaded and then undid/removed before saving, preventing orphan files
 * from accumulating in UploadThing storage.
 *
 * This call is fire-and-forget by design: it never throws and never blocks
 * the UI. Network or server failures are logged at warn level so that an
 * orphan file (recoverable manually) is preferred over a UI that locks up
 * during an undo interaction.
 *
 * Local-only URLs (empty, `blob:`, or `data:`) are skipped because they
 * represent unsubmitted previews that have not been uploaded yet.
 *
 * @param url - The public URL of the file to delete.
 * @param reason - Context tag forwarded to the server for logging.
 * @returns A promise that always resolves; failures are logged, not thrown.
 */
export async function requestUploadThingFileDeletion(url: string, reason: UploadThingClientCleanupReason): Promise<void> {
	const trimmedUrl = url.trim();
	if (!trimmedUrl || trimmedUrl.startsWith("blob:") || trimmedUrl.startsWith("data:")) {
		return;
	}

	try {
		const response = await fetch("/api/uploadthing-cleanup", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({url: trimmedUrl, reason}),
		});

		if (!response.ok) {
			log.warn("UploadThing cleanup endpoint returned non-OK", {
				status: response.status,
				url: trimmedUrl,
				reason,
			});
		}
	} catch (error) {
		log.warn("UploadThing cleanup request failed", {url: trimmedUrl, reason, error});
	}
}
