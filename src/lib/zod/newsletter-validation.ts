import {z} from "zod";
import {createEmailSchema} from "@/lib/zod/validate-email";

export const newsletterSchema = z.object({
	email: createEmailSchema(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
