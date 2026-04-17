import {z} from "zod";

/**
 * Zod schema for updating the hero image singleton row. Pass `null` to
 * clear the image and revert to the bundled defaults.
 */
export const heroImageUpdateSchema = z.object({
	imageUrl: z.string().url().nullable(),
});

export type HeroImageUpdateInput = z.infer<typeof heroImageUpdateSchema>;
