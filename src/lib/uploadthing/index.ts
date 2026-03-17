/**
 * Re-exported UploadThing components typed to the app's file router.
 *
 * Import from here instead of `@uploadthing/react` directly so the
 * generic types are pre-bound and every consumer gets autocomplete
 * on available route slugs (e.g. "featuredListingImage").
 */
import {generateUploadButton, generateUploadDropzone} from "@uploadthing/react";

import type {UploadRouter} from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<UploadRouter>();
export const UploadDropzone = generateUploadDropzone<UploadRouter>();
