/** Allowed image MIME types for listing/presale uploads. */
export const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** HTML `accept` attribute value mirroring `ALLOWED_IMAGE_MIME_TYPES`. */
export const IMAGE_ACCEPT_ATTRIBUTE = "image/jpeg,image/png,image/webp";

/** Maximum allowed image upload size in bytes (8 MB). */
export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Human-readable size limit, suitable for inline error messages. */
export const MAX_IMAGE_UPLOAD_LABEL = "8MB";
