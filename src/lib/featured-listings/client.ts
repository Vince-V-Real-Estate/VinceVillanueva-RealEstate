import {
  MAX_FEATURED_LISTINGS,
  type FeaturedListing,
  type FeaturedListingMutationInput,
  type FeaturedListingResponse,
  type FeaturedListingsListResponse,
  type FeaturedListingUpdateInput,
} from "@/lib/featured-listings/types";

interface ApiErrorShape {
  error?: string;
  details?: Record<string, string>;
}

export class FeaturedListingsApiError extends Error {
  public readonly status: number;
  public readonly details?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string>,
  ) {
    super(message);
    this.name = "FeaturedListingsApiError";
    this.status = status;
    this.details = details;
  }
}

const FEATURED_LISTINGS_API_BASE = "/api/featured-listings";

function getApiErrorMessage(body: ApiErrorShape | null): string {
  const fallbackMessage =
    body?.error ?? "Failed to perform featured listing request";
  if (!body?.details) {
    return fallbackMessage;
  }

  const detailMessages = Object.values(body.details).filter(
    (value): value is string => Boolean(value),
  );
  if (detailMessages.length === 0) {
    return fallbackMessage;
  }

  const detailsMessage = detailMessages.join(" ");
  if (fallbackMessage === "Validation failed") {
    return detailsMessage;
  }

  return `${fallbackMessage} ${detailsMessage}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

async function requestFeaturedListingsApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await parseJsonResponse<T & ApiErrorShape>(response);

  if (!response.ok) {
    const message = getApiErrorMessage(body);
    throw new FeaturedListingsApiError(message, response.status, body?.details);
  }

  if (!body) {
    throw new FeaturedListingsApiError("Empty API response", response.status);
  }

  return body;
}

interface FetchFeaturedListingsOptions {
  limit?: number;
  signal?: AbortSignal;
}

export async function fetchFeaturedListings(
  options: FetchFeaturedListingsOptions = {},
): Promise<FeaturedListing[]> {
  const limit = options.limit ?? MAX_FEATURED_LISTINGS;
  const query = new URLSearchParams({ limit: `${limit}` });
  const data = await requestFeaturedListingsApi<FeaturedListingsListResponse>(
    `${FEATURED_LISTINGS_API_BASE}?${query.toString()}`,
    {
      method: "GET",
      signal: options.signal,
    },
  );

  return data.listings;
}

export async function fetchFeaturedListing(
  id: string,
  options: { signal?: AbortSignal } = {},
): Promise<FeaturedListing> {
  const data = await requestFeaturedListingsApi<FeaturedListingResponse>(
    `${FEATURED_LISTINGS_API_BASE}/${id}`,
    {
      method: "GET",
      signal: options.signal,
    },
  );

  return data.listing;
}

export async function createFeaturedListing(
  input: FeaturedListingMutationInput,
): Promise<FeaturedListing> {
  const data = await requestFeaturedListingsApi<FeaturedListingResponse>(
    FEATURED_LISTINGS_API_BASE,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return data.listing;
}

export async function updateFeaturedListing(
  id: string,
  input: FeaturedListingUpdateInput,
): Promise<FeaturedListing> {
  const data = await requestFeaturedListingsApi<FeaturedListingResponse>(
    `${FEATURED_LISTINGS_API_BASE}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return data.listing;
}

export async function deleteFeaturedListing(id: string): Promise<void> {
  await requestFeaturedListingsApi<{ success: true }>(
    `${FEATURED_LISTINGS_API_BASE}/${id}`,
    {
      method: "DELETE",
    },
  );
}
