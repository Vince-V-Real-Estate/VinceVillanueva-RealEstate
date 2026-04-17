import {eq} from "drizzle-orm";

import {db} from "@/server/db";
import {HERO_IMAGE_SINGLETON_ID, heroImage} from "@/server/db/schemas";
import type {HeroImage} from "@/lib/hero-image/types";
import type {HeroImageUpdateInput} from "@/lib/zod/hero-image";

/**
 * Shape of a row read from the `hero_image` table.
 */
type HeroImageRow = typeof heroImage.$inferSelect;

/**
 * Converts a database row into the API-facing HeroImage shape.
 * @param {HeroImageRow | null} row - Row read from the database, if any.
 * @returns {HeroImage} Normalized hero image record.
 */
function mapRow(row: HeroImageRow | null): HeroImage {
	if (!row) {
		return {
			imageUrl: null,
			updatedAt: new Date(0).toISOString(),
		};
	}
	return {
		imageUrl: row.imageUrl,
		updatedAt: row.updatedAt.toISOString(),
	};
}

/**
 * Reads the singleton hero image row from the database, returning a
 * default-null record when the row does not yet exist.
 * @returns {Promise<HeroImage>} Current hero image record.
 */
export async function getHeroImage(): Promise<HeroImage> {
	const row = await db.query.heroImage.findFirst({
		where: eq(heroImage.id, HERO_IMAGE_SINGLETON_ID),
	});
	return mapRow(row ?? null);
}

/**
 * Upserts the singleton hero image row with the provided image URL.
 * Pass `null` to clear the image and fall back to the bundled defaults.
 * @param {HeroImageUpdateInput} input - Image URL to persist.
 * @param {string} updatedById - ID of the admin performing the update.
 * @returns {Promise<{previous: HeroImage; next: HeroImage}>} Previous and new records.
 */
export async function upsertHeroImage(input: HeroImageUpdateInput, updatedById: string): Promise<{previous: HeroImage; next: HeroImage}> {
	const previous = await getHeroImage();
	const now = new Date();

	const [row] = await db
		.insert(heroImage)
		.values({
			id: HERO_IMAGE_SINGLETON_ID,
			imageUrl: input.imageUrl,
			updatedById,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: heroImage.id,
			set: {
				imageUrl: input.imageUrl,
				updatedById,
				updatedAt: now,
			},
		})
		.returning();

	return {previous, next: mapRow(row ?? null)};
}
