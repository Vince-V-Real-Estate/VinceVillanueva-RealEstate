import {z} from "zod";
import {createEmailSchema} from "@/lib/zod/validate-email";
import {LEAD_FIELD_LIMITS, LEAD_SOURCES, PHONE_NUMBER_REGEX} from "@/utils/leads/types";

const leadNameSchema = z.string().min(2, "Name must be at least 2 characters").max(LEAD_FIELD_LIMITS.NAME_MAX, `Name cannot exceed ${LEAD_FIELD_LIMITS.NAME_MAX} characters`);

const leadEmailSchema = createEmailSchema({
	invalidMessage: "Invalid email address",
});

const leadPhoneSchema = z.string().regex(PHONE_NUMBER_REGEX, "Invalid phone number").optional().or(z.literal(""));

const leadMessageSchema = z.string().max(LEAD_FIELD_LIMITS.MESSAGE_MAX, `Message cannot exceed ${LEAD_FIELD_LIMITS.MESSAGE_MAX} characters`).optional();

const leadAddressSchema = z.string().max(LEAD_FIELD_LIMITS.ADDRESS_MAX, `Address cannot exceed ${LEAD_FIELD_LIMITS.ADDRESS_MAX} characters`).optional();

const leadSourceSchema = z.enum(LEAD_SOURCES, {
	errorMap: () => ({message: "Invalid lead source"}),
});

interface LeadConditionalInput {
	source: z.infer<typeof leadSourceSchema>;
	phone?: string;
	address?: string;
}

const validateLeadConditionals = (data: LeadConditionalInput, ctx: z.RefinementCtx) => {
	if (data.source === "sellers-guide-request" && (!data.phone || !PHONE_NUMBER_REGEX.test(data.phone))) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["phone"],
			message: "A valid phone number is required",
		});
	}

	if (data.source === "valuation" && (!data.address || data.address.trim().length === 0)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["address"],
			message: "Property address is required",
		});
	}
};

export const leadCaptureSchema = z
	.object({
		name: leadNameSchema,
		email: leadEmailSchema,
		phone: leadPhoneSchema,
		message: leadMessageSchema,
		address: leadAddressSchema,
		source: leadSourceSchema,
	})
	.superRefine(validateLeadConditionals);

export const createLeadSchema = z
	.object({
		fullName: leadNameSchema,
		email: leadEmailSchema,
		phone: leadPhoneSchema,
		message: leadMessageSchema,
		address: leadAddressSchema,
		source: leadSourceSchema,
	})
	.superRefine(validateLeadConditionals);

export type LeadCaptureValues = z.infer<typeof leadCaptureSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
