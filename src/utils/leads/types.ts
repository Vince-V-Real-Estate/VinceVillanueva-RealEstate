export const LEAD_SOURCES = ["listings", "valuation", "call", "newsletter", "sellers-guide-request", "buyers-guide-request"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/**
 * Long-form, human-readable labels for each lead source.
 * Used in email notifications where additional context is helpful.
 */
export const SOURCE_LABELS: Record<LeadSource, string> = {
	listings: "New Listings Alert",
	valuation: "Home Valuation Request",
	call: "Consultation Request",
	newsletter: "Newsletter Subscription",
	"sellers-guide-request": "Sellers Guide Request",
	"buyers-guide-request": "Buyers Guide Request",
};

/**
 * Compact labels for each lead source.
 * Used in dense dashboard tables where vertical space is limited.
 */
export const SOURCE_LABELS_SHORT: Record<LeadSource, string> = {
	listings: "New Listings",
	valuation: "Home Valuation",
	call: "Consultation",
	newsletter: "Newsletter",
	"sellers-guide-request": "Sellers Guide",
	"buyers-guide-request": "Buyers Guide",
};

/** Accent colour per source so the realtor can triage at a glance. */
export const SOURCE_COLORS: Record<LeadSource, string> = {
	listings: "#2563eb",
	valuation: "#7c3aed",
	call: "#059669",
	newsletter: "#d97706",
	"sellers-guide-request": "#db2777",
	"buyers-guide-request": "#0891b2",
};

/**
 * Shared phone-number validation regex used by both the lead-capture form
 * and the `/api/leads` route handler. Allows an optional leading `+`,
 * digits, spaces, parentheses, and hyphens, with a total length of 10–20.
 */
export const PHONE_NUMBER_REGEX = /^[+]?[\d\s()-]{10,20}$/;

/**
 * Maximum field lengths shared between the frontend form schema and the
 * backend `/api/leads` validation schema, so users see the same constraints
 * the API enforces.
 */
export const LEAD_FIELD_LIMITS = {
	NAME_MAX: 100,
	MESSAGE_MAX: 1000,
	ADDRESS_MAX: 200,
} as const;

export interface ILead {
	id?: string;
	fullName: string;
	email: string;
	phone?: string | null;
	message?: string | null;
	address?: string | null;
	source: LeadSource;
	realtorId: string;
	createdAt?: Date;
}

export interface ILeadCreateInput {
	fullName: string;
	email: string;
	phone?: string;
	message?: string;
	address?: string;
	source: LeadSource;
	realtorId: string;
}

export interface ILeadEmailData {
	fullName: string;
	email: string;
	phone?: string | null;
	message?: string | null;
	address?: string | null;
	source: LeadSource;
	realtorId: string;
	createdAt: Date;
}
