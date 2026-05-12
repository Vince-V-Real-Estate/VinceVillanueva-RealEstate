"use client";

import {useCallback, useEffect, useMemo, useState} from "react";

import {deletePresaleListing, fetchPresaleListings} from "@/lib/presales/client";
import {MAX_PRESALE_LISTINGS, type PresaleListing} from "@/lib/presales/types";
import {createLogger} from "@/lib/logger";
import {getErrorMessage, isAbortError} from "@/utils/error";

import {CurrentPreSaleHomes} from "./presale/CurrentPreSaleHomes";
import {PreSaleForm} from "./presale/PreSaleForm";

const log = createLogger("dashboard-presales");

/**
 * Manages presale listings and coordinates list actions with the form panel.
 * Handles fetching, creating, editing, and deleting presale listings.
 */
export default function PreSaleManager() {
	const [listings, setListings] = useState<PresaleListing[]>([]);
	const [maxListings, setMaxListings] = useState(MAX_PRESALE_LISTINGS);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeletePending, setIsDeletePending] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [selectedListing, setSelectedListing] = useState<PresaleListing | null>(null);

	const canCreateMore = useMemo(() => listings.length < maxListings, [listings.length, maxListings]);

	/**
	 * Loads presale listings from the API and updates local state.
	 * @param signal - Optional abort signal for request cancellation.
	 */
	const loadListings = useCallback(async (signal?: AbortSignal) => {
		try {
			const result = await fetchPresaleListings({signal});
			setListings(result.listings);
			setMaxListings(result.maxPresaleListings);
			setErrorMessage(null);
		} catch (error) {
			if (isAbortError(error)) {
				return;
			}

			const message = getErrorMessage(error);
			log.error("Failed to load presale listings", error);
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
	 * @param listing - The listing that should be edited.
	 */
	const handleEdit = (listing: PresaleListing) => {
		setSelectedListing(listing);
		setErrorMessage(null);
	};

	/**
	 * Deletes a listing after user confirmation and refreshes the list.
	 * The API handles UploadThing image cleanup automatically.
	 * @param listing - The listing to delete.
	 */
	const handleDelete = async (listing: PresaleListing) => {
		const shouldDelete = window.confirm(`Delete pre-sale listing "${listing.title}"?`);
		if (!shouldDelete) {
			return;
		}

		try {
			setIsDeletePending(true);
			await deletePresaleListing(listing.id);
			await loadListings();

			if (selectedListing?.id === listing.id) {
				setSelectedListing(null);
			}
		} catch (error) {
			const message = getErrorMessage(error);
			log.error("Failed to delete presale listing", error);
			setErrorMessage(message);
		} finally {
			setIsDeletePending(false);
		}
	};

	return (
		<section className="w-full max-w-full space-y-6 overflow-x-hidden">
			{/* Header */}
			<div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900">Pre-Sale Listings</h2>
					<p className="mt-1 text-sm text-gray-500">Manage up to {maxListings} pre-sale development listings.</p>
				</div>
				<span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
					{listings.length}/{maxListings} used
				</span>
			</div>

			{errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

			{/* Two-column layout: list on left, form on right (stacked on mobile) */}
			<div className="grid w-full max-w-full gap-6 lg:grid-cols-2 xl:gap-8">
				<CurrentPreSaleHomes
					listings={listings}
					isLoading={isLoading}
					isMutating={isDeletePending}
					onEdit={handleEdit}
					onDelete={(listing) => {
						void handleDelete(listing);
					}}
				/>

				<PreSaleForm
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
