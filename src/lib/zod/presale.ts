import {z} from "zod";

import {BATHROOM_INCREMENT} from "@/lib/constants/shared";
import {MAX_PRESALE_IMAGES} from "@/lib/presales/types";
import {countWords} from "@/utils/string";

const DESCRIPTION_MAX_WORDS = 100;

export const presaleIdSchema = z.string().uuid("Invalid presale listing id");

export const presaleInputSchema = z.object({
	title: z.string().trim().min(2, "Title must be at least 2 characters").max(120, "Title cannot exceed 120 characters"),
	description: z
		.string()
		.trim()
		.min(10, "Description must be at least 10 characters")
		.max(800, "Description cannot exceed 800 characters")
		.refine((value) => countWords(value) <= DESCRIPTION_MAX_WORDS, `Description cannot exceed ${DESCRIPTION_MAX_WORDS} words`),
	price: z.number().int("Price must be a whole number").min(1, "Price is required"),
	address: z.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address cannot exceed 200 characters"),
	bedrooms: z.number().int("Bedrooms must be a whole number").min(0, "Bedrooms cannot be negative").max(20, "Bedrooms cannot exceed 20"),
	bathrooms: z
		.number()
		.min(0, "Bathrooms cannot be negative")
		.max(20, "Bathrooms cannot exceed 20")
		.refine((value) => Number.isInteger(value / BATHROOM_INCREMENT), "Bathrooms must be in 0.5 increments"),
	squareFeet: z.number().int("Square feet must be a whole number").min(100, "Square feet must be at least 100").max(50000, "Square feet cannot exceed 50,000"),
	imageUrls: z.array(z.string().url("Each image must be a valid URL")).min(1, "At least one image is required").max(MAX_PRESALE_IMAGES, `Cannot exceed ${MAX_PRESALE_IMAGES} images`),
	status: z.string().trim().max(50, "Status cannot exceed 50 characters").nullable().optional(),
	completion: z.string().trim().min(2, "Completion estimate must be at least 2 characters").max(100, "Completion estimate cannot exceed 100 characters"),
	developer: z.string().trim().min(2, "Developer name must be at least 2 characters").max(200, "Developer name cannot exceed 200 characters"),
	amenities: z.array(z.string().trim().min(1, "Amenity cannot be empty").max(100, "Amenity cannot exceed 100 characters")).max(20, "Cannot exceed 20 amenities"),
});

export const updatePresaleInputSchema = presaleInputSchema.partial().refine((value) => Object.keys(value).length > 0, {message: "Provide at least one field to update"});

export type PresaleInput = z.infer<typeof presaleInputSchema>;
export type UpdatePresaleInput = z.infer<typeof updatePresaleInputSchema>;
