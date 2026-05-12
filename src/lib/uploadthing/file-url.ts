/**
 * Shape returned by UploadThing's client SDK after a successful upload.
 * Different versions of the SDK expose the URL under different fields,
 * so this helper checks each known location.
 */
export interface UploadedFileLike {
	serverData?: {url?: string} | null;
	ufsUrl?: string;
	url?: string;
}

/**
 * Extracts the public URL from an UploadThing client upload result.
 * Tries `serverData.url`, `ufsUrl`, and `url` in order, returning
 * `null` when none are populated.
 * @param file Uploaded file descriptor returned by the UploadThing client.
 * @returns Resolved URL string, or `null` when unavailable.
 */
export function getUploadedFileUrl(file: UploadedFileLike | undefined): string | null {
	if (!file) return null;
	return file.serverData?.url ?? file.ufsUrl ?? file.url ?? null;
}
