import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { getSession } from "@/server/better-auth/server";
import { createLogger } from "@/lib/logger";

const f = createUploadthing();
const log = createLogger("uploadthing");

const adminOnlyMiddleware = async () => {
  const session = await getSession();

  if (!session?.user) {
    throw new UploadThingError("Unauthorized");
  }

  const user = session.user as { id: string; role?: unknown };
  if (user.role !== "admin") {
    throw new UploadThingError("Forbidden: admin access required");
  }

  return { userId: user.id };
};

/**
 * UploadThing file router.
 *
 * Each key is a "route slug" that the client references when uploading.
 * Add new routes here as the product grows; keep each route focused on
 * a single use-case so permissions stay granular.
 */
export const uploadRouter = {
  /**
   * Featured listing images (hero / gallery).
   * Admin-only. Accepts jpg, png, webp up to 8 MB, max 10 files per request.
   */
  featuredListingImage: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
  })
    .middleware(adminOnlyMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      log.info("Featured listing image uploaded", {
        userId: metadata.userId,
        fileName: file.name,
        url: file.ufsUrl,
      });

      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  /**
   * Downloadable PDF documents (floor plans, brochures, disclosure docs).
   * Admin-only. Accepts PDF up to 16 MB, max 5 files per request.
   */
  listingDocument: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
  })
    .middleware(adminOnlyMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      log.info("Listing document uploaded", {
        userId: metadata.userId,
        fileName: file.name,
        url: file.ufsUrl,
      });

      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
