import {z} from "zod";

import {featuredListingInputSchema} from "@/lib/zod/featured-listing";

interface FeaturedListingFormInput {
	title: string;
	description: string;
	imageUrl: string;
	price: string;
	address: string;
	bedrooms: string;
	bathrooms: string;
	squareFeet: string;
}

/**
 * Normalizes numeric input by removing commas and whitespace.
 * @param {string} value - The numeric string entered by the user.
 * @returns {string} The normalized numeric string.
 */
function normalizeNumericValue(value: string): string {
	return value.trim().replaceAll(",", "").replace(/\s+/g, "");
}

/**
 * Creates a schema that parses and validates whole-number string input.
 * @param {string} fieldName - The field label used in validation messages.
 * @returns {z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>, number, string>} A schema that returns a safe integer.
 */
function createWholeNumberStringSchema(fieldName: string) {
	return z
		.string()
		.transform(normalizeNumericValue)
		.refine((value) => /^\d+$/.test(value), `${fieldName} must be a valid whole number`)
		.transform((value) => Number(value))
		.refine((value) => Number.isSafeInteger(value), `${fieldName} must be a valid whole number`);
}

const decimalNumberStringSchema = z
	.string()
	.transform(normalizeNumericValue)
	.refine((value) => /^(\d+(\.\d*)?|\.\d+)$/.test(value), "Bathrooms must be a valid number")
	.transform((value) => Number.parseFloat(value))
	.refine((value) => Number.isFinite(value), "Bathrooms must be a valid number");

export const featuredListingFormInputSchema = z
	.object({
		title: z.string().transform((value) => value.trim()),
		description: z.string().transform((value) => value.trim()),
		imageUrl: z.string().transform((value) => value.trim()),
		price: createWholeNumberStringSchema("Price"),
		address: z.string().transform((value) => value.trim()),
		bedrooms: createWholeNumberStringSchema("Bedrooms"),
		bathrooms: decimalNumberStringSchema,
		squareFeet: createWholeNumberStringSchema("Square feet"),
	})
	.pipe(featuredListingInputSchema);

/**
 * Parses form values into validated featured listing mutation input.
 * @param {FeaturedListingFormInput} form - The featured listing form values.
 * @returns {z.infer<typeof featuredListingFormInputSchema>} The validated mutation payload.
 * @throws {Error} Throws when any field fails validation.
 */
export function parseFeaturedListingFormInput(form: FeaturedListingFormInput): z.infer<typeof featuredListingFormInputSchema> {
	const result = featuredListingFormInputSchema.safeParse(form);
	if (!result.success) {
		const firstIssueMessage = result.error.issues[0]?.message;
		throw new Error(firstIssueMessage ?? "Invalid featured listing input");
	}

	return result.data;
}
