import { UTApi } from "uploadthing/server";

import { env } from "@/env";
import { createLogger } from "@/lib/logger";

const log = createLogger("uploadthing-cleanup");
const utapi = new UTApi({ token: env.UPLOADTHING_TOKEN });

const FILE_KEY_PATH_SEGMENT = "f";
const APP_ID_PATH_SEGMENT = "a";

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

interface DeleteUploadThingFileByUrlOptions {
  reason: "listing-delete" | "listing-image-replace";
  listingId: string;
}

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
