/**
 * Parses and validates a "limit" query parameter for listing endpoints.
 * Returns the configured `maxAllowed` when the param is missing, the
 * parsed integer when it falls within `[1, maxAllowed]`, and `null`
 * when the value is invalid or out of range.
 * @param limitParam Raw string value from the URL query parameter (may be null).
 * @param maxAllowed Inclusive upper bound and default when no value is supplied.
 * @returns Valid integer limit, or `null` when the input is invalid.
 */
export function parseListingsLimit(limitParam: string | null, maxAllowed: number): number | null {
	if (limitParam === null) {
		return maxAllowed;
	}

	const parsedLimit = Number.parseInt(limitParam, 10);

	if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > maxAllowed) {
		return null;
	}

	return parsedLimit;
}
