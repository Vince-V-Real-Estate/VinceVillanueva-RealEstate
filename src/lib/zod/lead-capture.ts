import { z } from "zod";

export const leadCaptureSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().optional(),
  address: z.string().optional(), // For home valuation
  type: z.enum(["listings", "valuation", "call", "contact"]),
});

export type LeadCaptureValues = z.infer<typeof leadCaptureSchema>;
