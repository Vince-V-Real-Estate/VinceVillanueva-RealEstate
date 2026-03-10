import { z } from "zod";
import { LEAD_SOURCES } from "@/utils/leads/types";

export const leadCaptureSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().optional(),
  address: z.string().optional(), // For home valuation
  source: z.enum(LEAD_SOURCES),
});

export type LeadCaptureValues = z.infer<typeof leadCaptureSchema>;
