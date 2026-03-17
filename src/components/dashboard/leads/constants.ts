import type { LeadSource } from "@/utils/leads/types";

export const SOURCE_LABELS: Record<LeadSource, string> = {
  listings: "New Listings",
  valuation: "Home Valuation",
  call: "Consultation",
  newsletter: "Newsletter",
};

export const SOURCE_COLORS: Record<LeadSource, string> = {
  listings: "bg-blue-500",
  valuation: "bg-emerald-500",
  call: "bg-amber-500",
  newsletter: "bg-purple-500",
};

/**
 * Formats a date string into a human-readable format.
 * @param dateStr - ISO date string from the database
 * @returns Formatted date string (e.g., "Jan 15, 2026, 3:45 PM")
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
