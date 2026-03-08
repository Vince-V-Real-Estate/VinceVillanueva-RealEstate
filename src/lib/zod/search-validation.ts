import { z } from "zod";

export const searchSchema = z.object({
  listingType: z.enum(["Buy", "Rent", "Sold"], {
    required_error: "Please select a listing type",
  }),
  location: z
    .string()
    .min(1, "Please enter a city, neighborhood, or ZIP code")
    .max(100, "Location must be 100 characters or less"),
});

export type SearchFormData = z.infer<typeof searchSchema>;
