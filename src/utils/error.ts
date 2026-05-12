/**
 * Extracts a user-friendly error message from an unknown error object.
 * @param error The error to extract a message from.
 * @param fallback Optional fallback string to use when the error is not an Error instance.
 * @returns The formatted error message.
 */
export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
	if (error instanceof Error) return error.message;
	return fallback;
}

/**
 * Checks whether an error is caused by an aborted request.
 * @param error The error to inspect.
 * @returns True when the error is an AbortError.
 */
export function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === "AbortError";
}
