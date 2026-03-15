import { UTApi } from "uploadthing/server";

import { env } from "@/env";
import { createLogger } from "@/lib/logger";

const log = createLogger("uploadthing-cleanup");

/** UploadThing API client initialized with the project's API token */
const utapi = new UTApi({ token: env.UPLOADTHING_TOKEN });

/** Path segment that identifies the file key in canonical UploadThing URLs */
const FILE_KEY_PATH_SEGMENT = "f";
/** Path segment that identifies app-scoped URLs in UploadThing (e.g., /a/<appId>/<fileKey>) */
const APP_ID_PATH_SEGMENT = "a";

/**
 * Checks if a hostname belongs to UploadThing's CDN domains.
 * Supports both legacy and newer URL formats.
 * @param hostname - The hostname portion of a URL
 * @returns true if the hostname is a known UploadThing host
 */
function isUploadThingHost(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();

  return (
    normalizedHostname === "uploadthing.com" ||
    normalizedHostname.endsWith(".uploadthing.com") ||
    normalizedHostname === "ufs.sh" ||
    normalizedHostname.endsWith(".ufs.sh") ||
    normalizedHostname === "utfs.io" ||
    normalizedHostname.endsWith(".utfs.io")
  );
}

/**
 * Extracts the file key from a UploadThing URL path.
 * Handles two URL formats:
 * - Canonical: /f/<fileKey> (e.g., https://utfs.io/f/abc123)
 * - App-scoped: /a/<appId>/<fileKey> (e.g., https://utfs.io/a/appId/abc123)
 * @param pathname - The pathname portion of a URL
 * @returns The extracted file key, or null if not found
 */
function extractFileKeyFromPath(pathname: string): string | null {
  const pathSegments = pathname.split("/").filter(Boolean);

  // Canonical URLs: /f/<fileKey>
  const directFilePathIndex = pathSegments.lastIndexOf(FILE_KEY_PATH_SEGMENT);
  if (directFilePathIndex >= 0) {
    return pathSegments[directFilePathIndex + 1] ?? null;
  }

  // Alternative app-scoped URLs: /a/<appId>/<fileKey>
  const appScopedPathIndex = pathSegments.lastIndexOf(APP_ID_PATH_SEGMENT);
  if (appScopedPathIndex >= 0) {
    return pathSegments[appScopedPathIndex + 2] ?? null;
  }

  return null;
}

/**
 * Extracts the UploadThing file key from a full URL string.
 * Validates that the URL is from a known UploadThing host before extracting.
 * @param fileUrl - The full URL of an uploaded file
 * @returns The file key for use with UploadThing API, or null if invalid
 */
export function extractUploadThingFileKey(fileUrl: string): string | null {
  const normalizedUrl = fileUrl.trim();
  if (!normalizedUrl) {
    return null;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return null;
  }

  if (!isUploadThingHost(parsedUrl.hostname)) {
    return null;
  }

  const fileKeyFromPath = extractFileKeyFromPath(parsedUrl.pathname);
  if (!fileKeyFromPath) {
    return null;
  }

  try {
    return decodeURIComponent(fileKeyFromPath);
  } catch {
    return fileKeyFromPath;
  }
}

/** Options for the delete operation, including context for logging */
interface DeleteUploadThingFileByUrlOptions {
  /** Reason for deletion - used for logging and debugging */
  reason: "listing-delete" | "listing-image-replace";
  /** Associated listing ID for correlation in logs */
  listingId: string;
}

/**
 * Deletes a file from UploadThing storage given its public URL.
 * Used to clean up images when listings are deleted or have their images replaced.
 * Logs warnings for unsupported URLs or failed deletions but does not throw.
 * @param fileUrl - The public URL of the file to delete
 * @param options - Context for the deletion (reason and listing ID for logging)
 */
export async function deleteUploadThingFileByUrl(
  fileUrl: string,
  options: DeleteUploadThingFileByUrlOptions,
): Promise<void> {
  const fileKey = extractUploadThingFileKey(fileUrl);
  if (!fileKey) {
    log.warn("UploadThing cleanup skipped: unsupported file URL", {
      listingId: options.listingId,
      reason: options.reason,
      fileUrl,
    });
    return;
  }

  try {
    const result = await utapi.deleteFiles(fileKey);
    if (!result.success || result.deletedCount < 1) {
      log.warn("UploadThing cleanup reported unsuccessful result", {
        listingId: options.listingId,
        reason: options.reason,
        fileKey,
        result,
      });
    }
  } catch (error) {
    log.error("UploadThing cleanup failed", error);
  }
}
