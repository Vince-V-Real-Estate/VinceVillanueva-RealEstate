import { z } from "zod";

export const searchSchema = z.object({
  location: z
    .string()
    .min(1, "Please enter a city, neighborhood, or ZIP code")
    .max(100, "Location must be 100 characters or less"),
});

export type SearchFormData = z.infer<typeof searchSchema>;
