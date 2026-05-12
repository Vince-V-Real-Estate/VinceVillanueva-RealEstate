/**
 * Shape of error responses from JSON APIs.
 * May contain a top-level error message and/or field-level validation details.
 */
export interface ApiErrorShape {
	error?: string;
	details?: Record<string, string>;
}

/**
 * Base class for typed API errors. Concrete clients should extend this
 * (e.g., `FeaturedListingsApiError`) so consumers can keep using
 * `instanceof` to distinguish error sources.
 */
export class ApiError extends Error {
	public readonly status: number;
	public readonly details?: Record<string, string>;

	constructor(message: string, status: number, details?: Record<string, string>) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.details = details;
	}
}

interface CreateApiClientOptions<E extends ApiError> {
	/** Constructor used to instantiate errors thrown by the client. */
	ErrorClass: new (message: string, status: number, details?: Record<string, string>) => E;
	/** Fallback message used when the response body has no `error` field. */
	fallbackMessage: string;
}

/**
 * Builds a typed JSON API client that normalizes error parsing across endpoints.
 * The returned `request` function throws `ErrorClass` when the response is
 * non-OK or contains an unexpected empty body.
 * @param options Configuration controlling the error constructor and fallback message.
 * @returns Object containing a single `request` function.
 */
export function createApiClient<E extends ApiError>(options: CreateApiClientOptions<E>) {
	const {ErrorClass, fallbackMessage} = options;

	function allowsEmptySuccessBody(response: Response, init?: RequestInit): boolean {
		if (response.status === 204 || response.status === 205) return true;

		const method = (init?.method ?? "GET").toUpperCase();
		return method === "HEAD";
	}

	function getApiErrorMessage(body: ApiErrorShape | null): string {
		const baseMessage = body?.error ?? fallbackMessage;
		if (!body?.details) return baseMessage;

		const detailMessages = Object.values(body.details).filter((v): v is string => Boolean(v));
		if (detailMessages.length === 0) return baseMessage;

		const detailsMessage = detailMessages.join(" ");
		if (baseMessage === "Validation failed") return detailsMessage;
		return `${baseMessage} ${detailsMessage}`;
	}

	async function parseJsonResponse<T>(response: Response): Promise<T | null> {
		const text = await response.text();
		if (!text) return null;
		try {
			return JSON.parse(text) as T;
		} catch {
			return null;
		}
	}

	async function request<T>(input: string, init?: RequestInit): Promise<T> {
		const response = await fetch(input, {
			...init,
			headers: {
				"Content-Type": "application/json",
				...init?.headers,
			},
		});

		const body = await parseJsonResponse<T & ApiErrorShape>(response);

		if (!response.ok) {
			throw new ErrorClass(getApiErrorMessage(body), response.status, body?.details);
		}

		if (!body) {
			if (allowsEmptySuccessBody(response, init)) {
				return undefined as T;
			}

			throw new ErrorClass("Empty API response", response.status);
		}

		return body;
	}

	return {request};
}
