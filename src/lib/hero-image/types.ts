/**
 * Shared types for the hero image feature.
 *
 * The hero section uses a singleton database row that may contain a
 * single URL used for both desktop and mobile rendering. When the URL
 * is absent, the bundled default assets in `public/` are used instead
 * (one for desktop, one for mobile).
 */

export const DEFAULT_HERO_DESKTOP_IMAGE_URL = "/vv-asset-2-desktop.png";
export const DEFAULT_HERO_MOBILE_IMAGE_URL = "/vv-asset-2-mobile.png";

export interface HeroImage {
	/** Absolute URL for the uploaded hero image, or null when defaults are used. */
	imageUrl: string | null;
	/** ISO-8601 timestamp of the last update. */
	updatedAt: string;
}

export type HeroImageResponse =
	| {
			/** Payload returned by withApiHandler routes. */
			heroImage: HeroImage;
	  }
	| {
			/** Compatibility payload shape returned by some wrappers. */
			data: {
				heroImage: HeroImage;
			};
	  };

/**
 * Returns the effective URL to render for a given viewport variant,
 * falling back to the bundled default when the stored URL is null.
 * When a custom image is uploaded, the same URL is used for both
 * desktop and mobile.
 * @param {string | null | undefined} storedUrl - URL stored in the database, or null/undefined.
 * @param {"desktop" | "mobile"} variant - Which fallback to use when nothing is uploaded.
 * @returns {string} The URL to render.
 */
export function resolveHeroImageUrl(storedUrl: string | null | undefined, variant: "desktop" | "mobile"): string {
	if (storedUrl && storedUrl.trim().length > 0) {
		return storedUrl;
	}
	return variant === "desktop" ? DEFAULT_HERO_DESKTOP_IMAGE_URL : DEFAULT_HERO_MOBILE_IMAGE_URL;
}
