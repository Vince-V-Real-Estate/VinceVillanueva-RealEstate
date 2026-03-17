"use client";

import {useCallback, useEffect, useMemo, useState} from "react";

import {FeaturedListingsApiError, deleteFeaturedListing, fetchFeaturedListings} from "@/lib/featured-listings/client";
import {MAX_FEATURED_LISTINGS, type FeaturedListing} from "@/lib/featured-listings/types";
import {createLogger} from "@/lib/logger";

import {CurrentFeaturedListings} from "./featured-listings/CurrentFeaturedListings";
import {FeaturedListingForm} from "./featured-listings/FeaturedListingForm";

const log = createLogger("dashboard-featured-listings");

/**
 * Extracts a user-friendly error message from an unknown error object.
 * @param {unknown} error - The error to extract a message from.
 * @returns {string} The formatted error message.
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof FeaturedListingsApiError) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected error occurred";
}

/**
 * Checks whether an error is caused by an aborted request.
 * @param {unknown} error - The error to inspect.
 * @returns {boolean} True when the error is an AbortError.
 */
function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === "AbortError";
}

/**
 * Manages featured listings and coordinates list actions with the form panel.
 * @returns {JSX.Element} The rendered featured listings manager UI.
 */
export function FeaturedListingsManager() {
	const [listings, setListings] = useState<FeaturedListing[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeletePending, setIsDeletePending] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [selectedListing, setSelectedListing] = useState<FeaturedListing | null>(null);

	const canCreateMore = useMemo(() => listings.length < MAX_FEATURED_LISTINGS, [listings.length]);

	/**
	 * Loads featured listings from the API and updates local list state.
	 * @async
	 * @param {AbortSignal} [signal] - Optional signal used to cancel the request.
	 * @returns {Promise<void>} Resolves when list state has been updated.
	 */
	const loadListings = useCallback(async (signal?: AbortSignal) => {
		try {
			const result = await fetchFeaturedListings({
				limit: MAX_FEATURED_LISTINGS,
				signal,
			});
			setListings(result);
			setErrorMessage(null);
		} catch (error) {
			if (isAbortError(error)) {
				return;
			}

			const message = getErrorMessage(error);
			log.error("Failed to load featured listings", error);
			setErrorMessage(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		void loadListings(controller.signal);

		return () => {
			controller.abort();
		};
	}, [loadListings]);

	/**
	 * Selects a listing for editing in the form panel.
	 * @param {FeaturedListing} listing - The listing that should be edited.
	 * @returns {void}
	 */
	const handleEdit = (listing: FeaturedListing) => {
		setSelectedListing(listing);
		setErrorMessage(null);
	};

	/**
	 * Deletes a listing after user confirmation and refreshes the list.
	 * @async
	 * @param {FeaturedListing} listing - The listing to delete.
	 * @returns {Promise<void>} Resolves when deletion and refresh complete.
	 */
	const handleDelete = async (listing: FeaturedListing) => {
		const shouldDelete = window.confirm(`Delete featured listing at ${listing.address}?`);
		if (!shouldDelete) {
			return;
		}

		try {
			setIsDeletePending(true);
			await deleteFeaturedListing(listing.id);
			await loadListings();

			if (selectedListing?.id === listing.id) {
				setSelectedListing(null);
			}
		} catch (error) {
			const message = getErrorMessage(error);
			log.error("Failed to delete featured listing", error);
			setErrorMessage(message);
		} finally {
			setIsDeletePending(false);
		}
	};

	return (
		<section className="w-full max-w-full space-y-6 overflow-x-hidden">
			<div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900">Featured Listings Carousel</h2>
					<p className="mt-1 text-sm text-gray-500">Manage up to {MAX_FEATURED_LISTINGS} listings shown on the homepage carousel.</p>
				</div>
				<span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
					{listings.length}/{MAX_FEATURED_LISTINGS} used
				</span>
			</div>

			{errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

			<div className="grid w-full max-w-full gap-6 lg:grid-cols-2 xl:gap-8">
				<CurrentFeaturedListings
					listings={listings}
					isLoading={isLoading}
					isMutating={isDeletePending}
					onEdit={handleEdit}
					onDelete={(listing) => {
						void handleDelete(listing);
					}}
				/>

				<FeaturedListingForm
					selectedListing={selectedListing}
					listingsCount={listings.length}
					canCreateMore={canCreateMore}
					isDeletePending={isDeletePending}
					onListingsChange={async () => {
						await loadListings();
					}}
					onCancelEditSelection={() => {
						setSelectedListing(null);
					}}
				/>
			</div>
		</section>
	);
}
