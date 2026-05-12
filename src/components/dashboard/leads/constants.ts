import type {LeadSource} from "@/utils/leads/types";
import {SOURCE_LABELS_SHORT} from "@/utils/leads/types";

/** Compact source labels used in dense dashboard tables. */
export const SOURCE_LABELS = SOURCE_LABELS_SHORT;

/** Tailwind background classes for source badges in the dashboard. */
export const SOURCE_COLORS: Record<LeadSource, string> = {
	listings: "bg-blue-500",
	valuation: "bg-emerald-500",
	call: "bg-amber-500",
	newsletter: "bg-purple-500",
	"sellers-guide-request": "bg-pink-500",
	"buyers-guide-request": "bg-cyan-500",
};
