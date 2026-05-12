/**
 * Formats a numeric price to a compact CAD currency string.
 * @param price The numeric price value.
 * @returns Formatted price string (e.g., "$899,000").
 */
export function formatPrice(price: number): string {
	return new Intl.NumberFormat("en-CA", {
		style: "currency",
		currency: "CAD",
		maximumFractionDigits: 0,
	}).format(price);
}

/**
 * Formats a bathroom count, showing a decimal only when the value is not a whole number.
 * @param count The number of bathrooms.
 * @returns Formatted string (e.g., "2" or "2.5").
 */
export function formatBathrooms(count: number): string {
	return Number.isInteger(count) ? `${count}` : count.toFixed(1);
}

export type DateFormatStyle = "short" | "long" | "datetime";

/**
 * Formats a Date or date string into a human-readable string.
 * - "short": "Jan 15, 2026, 3:45 PM"
 * - "long": "January 15, 2026"
 * - "datetime": "Mon, Jan 15, 2026, 3:45 PM"
 * @param date The Date object or ISO date string to format.
 * @param style The formatting style to apply. Defaults to "short".
 * @returns Formatted date string, or "N/A" for invalid dates.
 */
export function formatDate(date: Date | string, style: DateFormatStyle = "short"): string {
	const d = typeof date === "string" ? new Date(date) : date;

	if (Number.isNaN(d.getTime())) {
		return "N/A";
	}

	if (style === "long") {
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}

	if (style === "datetime") {
		return d.toLocaleDateString("en-US", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	}

	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}
