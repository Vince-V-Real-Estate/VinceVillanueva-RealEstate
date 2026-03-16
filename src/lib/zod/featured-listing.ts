import { z } from "zod";

const BATHROOM_INCREMENT = 0.5;
const DESCRIPTION_MAX_WORDS = 50;

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export const featuredListingIdSchema = z
  .string()
  .uuid("Invalid featured listing id");

export const featuredListingInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(400, "Description cannot exceed 400 characters")
    .refine(
      (value) => countWords(value) <= DESCRIPTION_MAX_WORDS,
      `Description cannot exceed ${DESCRIPTION_MAX_WORDS} words`,
    ),
  imageUrl: z.string().url("A valid image URL is required"),
  price: z
    .number()
    .int("Price must be a whole number")
    .min(1, "Price is required"),
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters"),
  bedrooms: z
    .number()
    .int("Bedrooms must be a whole number")
    .min(0, "Bedrooms cannot be negative")
    .max(20, "Bedrooms cannot exceed 20"),
  bathrooms: z
    .number()
    .min(0, "Bathrooms cannot be negative")
    .max(20, "Bathrooms cannot exceed 20")
    .refine(
      (value) => Number.isInteger(value / BATHROOM_INCREMENT),
      "Bathrooms must be in 0.5 increments",
    ),
  squareFeet: z
    .number()
    .int("Square feet must be a whole number")
    .min(100, "Square feet must be at least 100")
    .max(50000, "Square feet cannot exceed 50,000"),
});

export const updateFeaturedListingInputSchema = featuredListingInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export type FeaturedListingInput = z.infer<typeof featuredListingInputSchema>;
export type UpdateFeaturedListingInput = z.infer<
  typeof updateFeaturedListingInputSchema
>;
