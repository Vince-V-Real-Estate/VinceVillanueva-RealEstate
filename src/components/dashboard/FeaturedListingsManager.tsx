"use client";

import {useActionState, useEffect, useMemo, useRef, useState} from "react";
import {FeaturedListingsApiError, createFeaturedListing, deleteFeaturedListing, fetchFeaturedListings, updateFeaturedListing} from "@/lib/featured-listings/client";
import {MAX_FEATURED_LISTINGS, type FeaturedListing, type FeaturedListingMutationInput} from "@/lib/featured-listings/types";
import {createLogger} from "@/lib/logger";
import type {UploadedUploadThingFile} from "@/components/ui/file-upload";

import {CurrentFeaturedListings} from "./featured-listings/CurrentFeaturedListings";
import {FeaturedListingForm} from "./featured-listings/FeaturedListingForm";
import type {FeaturedListingFormState, FeaturedListingSubmitState} from "./featured-listings/types";

const log = createLogger("dashboard-featured-listings");

interface WholeNumberOptions {
	min?: number;
	max?: number;
	minMessage?: string;
	maxMessage?: string;
}

const EMPTY_FORM: FeaturedListingFormState = {
	title: "",
	description: "",
	imageUrl: "",
	price: "",
	address: "",
	bedrooms: "",
	bathrooms: "",
	squareFeet: "",
};

const INITIAL_SUBMIT_STATE: FeaturedListingSubmitState = {
	errorMessage: null,
	statusMessage: null,
};

const MAX_BEDROOMS = 20;
const MAX_BATHROOMS = 20;
const MIN_SQUARE_FEET = 100;
const MAX_SQUARE_FEET = 50000;
const MAX_DESCRIPTION_WORDS = 50;

/**
 * Counts the number of words in a given string.
 * @param {string} value - The string to count words in.
 * @returns {number} The number of words in the string.
 */
function countWords(value: string): number {
	return value.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Converts a FeaturedListing object to form state for editing.
 * @param {FeaturedListing} listing - The featured listing to convert.
 * @returns {FeaturedListingFormState} The form state object.
 */
function toFormState(listing: FeaturedListing): FeaturedListingFormState {
	return {
		title: listing.title,
		description: listing.description,
		imageUrl: listing.imageUrl,
		price: `${listing.price}`,
		address: listing.address,
		bedrooms: `${listing.bedrooms}`,
		bathrooms: `${listing.bathrooms}`,
		squareFeet: `${listing.squareFeet}`,
	};
}

/**
 * Normalizes a numeric string by removing commas and whitespace.
 * @param {string} value - The numeric string to normalize.
 * @returns {string} The normalized string.
 */
function normalizeNumericValue(value: string): string {
	return value.trim().replaceAll(",", "").replace(/\s+/g, "");
}

/**
 * Parses a string as a whole number with optional min/max validation.
 * @param {string} value - The string to parse.
 * @param {string} fieldName - The name of the field for error messages.
 * @param {WholeNumberOptions} [options] - Optional validation options.
 * @returns {number} The parsed whole number.
 * @throws {Error} Throws when the value is not a valid whole number or violates constraints.
 */
function parseWholeNumber(value: string, fieldName: string, options: WholeNumberOptions = {}): number {
	const normalizedValue = normalizeNumericValue(value);

	if (!/^\d+$/.test(normalizedValue)) {
		throw new Error(`${fieldName} must be a valid whole number`);
	}

	const parsed = Number(normalizedValue);

	if (!Number.isSafeInteger(parsed)) {
		throw new Error(`${fieldName} must be a valid whole number`);
	}

	if (options.min !== undefined && parsed < options.min) {
		throw new Error(options.minMessage ?? `${fieldName} must be at least ${options.min}`);
	}

	if (options.max !== undefined && parsed > options.max) {
		throw new Error(options.maxMessage ?? `${fieldName} cannot exceed ${options.max}`);
	}

	return parsed;
}

/**
 * Parses a price value string, requiring at least 1 as the minimum.
 * @param {string} value - The price string to parse.
 * @returns {number} The parsed price value.
 * @throws {Error} Throws when the price is invalid or missing.
 */
function parsePriceValue(value: string): number {
	return parseWholeNumber(value, "Price", {
		min: 1,
		minMessage: "Price is required",
	});
}

/**
 * Parses a bathroom count value allowing decimal values in 0.5 increments.
 * @param {string} value - The bathroom count string to parse.
 * @returns {number} The parsed bathroom count.
 * @throws {Error} Throws when the value is invalid or exceeds the maximum.
 */
function parseBathroomValue(value: string): number {
	const normalizedValue = normalizeNumericValue(value);

	if (!/^(\d+(\.\d*)?|\.\d+)$/.test(normalizedValue)) {
		throw new Error("Bathrooms must be a valid number");
	}

	const parsed = Number.parseFloat(normalizedValue);

	if (!Number.isFinite(parsed) || parsed < 0) {
		throw new Error("Bathrooms must be a valid number");
	}

	if (parsed > MAX_BATHROOMS) {
		throw new Error(`Bathrooms cannot exceed ${MAX_BATHROOMS}`);
	}

	const halfStep = parsed * 2;
	if (!Number.isInteger(halfStep)) {
		throw new Error("Bathrooms must be in 0.5 increments");
	}

	return parsed;
}

/**
 * Builds a mutation input object from the form state after validating all fields.
 * @param {FeaturedListingFormState} form - The form state to validate and transform.
 * @returns {FeaturedListingMutationInput} The validated mutation input.
 * @throws {Error} Throws when any field fails validation.
 */
function buildMutationInput(form: FeaturedListingFormState): FeaturedListingMutationInput {
	if (!form.imageUrl.trim()) {
		throw new Error("Please upload an image before saving");
	}

	const title = form.title.trim();
	const description = form.description.trim();
	const address = form.address.trim();

	if (title.length < 2) {
		throw new Error("Title must be at least 2 characters");
	}

	if (address.length < 5) {
		throw new Error("Address must be at least 5 characters");
	}

	if (description.length < 10) {
		throw new Error("Description must be at least 10 characters");
	}

	if (countWords(description) > MAX_DESCRIPTION_WORDS) {
		throw new Error(`Description cannot exceed ${MAX_DESCRIPTION_WORDS} words`);
	}

	return {
		title,
		description,
		imageUrl: form.imageUrl,
		price: parsePriceValue(form.price),
		address,
		bedrooms: parseWholeNumber(form.bedrooms, "Bedrooms", {
			min: 0,
			max: MAX_BEDROOMS,
			minMessage: "Bedrooms cannot be negative",
			maxMessage: `Bedrooms cannot exceed ${MAX_BEDROOMS}`,
		}),
		bathrooms: parseBathroomValue(form.bathrooms),
		squareFeet: parseWholeNumber(form.squareFeet, "Square feet", {
			min: MIN_SQUARE_FEET,
			max: MAX_SQUARE_FEET,
			minMessage: `Square feet must be at least ${MIN_SQUARE_FEET}`,
			maxMessage: `Square feet cannot exceed ${MAX_SQUARE_FEET.toLocaleString()}`,
		}),
	};
}

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
 * Checks if an error is an AbortError from a cancelled fetch request.
 * @param {unknown} error - The error to check.
 * @returns {boolean} True if the error is an AbortError.
 */
function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === "AbortError";
}

export function FeaturedListingsManager() {
	const [listings, setListings] = useState<FeaturedListing[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [originalEditImageUrl, setOriginalEditImageUrl] = useState<string | null>(null);
	const [formState, setFormState] = useState<FeaturedListingFormState>(EMPTY_FORM);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const formStateRef = useRef<FeaturedListingFormState>(EMPTY_FORM);
	const editingIdRef = useRef<string | null>(null);

	const canCreateMore = useMemo(() => listings.length < MAX_FEATURED_LISTINGS, [listings.length]);

	/**
	 * Loads featured listings from the API with optional abort signal support.
	 * @async
	 * @param {AbortSignal} [signal] - Optional signal to abort the request.
	 * @returns {Promise<void>} Resolves when listings are loaded.
	 */
	const loadListings = async (signal?: AbortSignal) => {
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
	};

	const [actionState, formAction, isPending] = useActionState(async (_previousState: FeaturedListingSubmitState, _formData: FormData): Promise<FeaturedListingSubmitState> => {
		try {
			const payload = buildMutationInput(formStateRef.current);
			const activeEditingId = editingIdRef.current;
			const isEditing = Boolean(activeEditingId);

			if (isEditing && activeEditingId) {
				await updateFeaturedListing(activeEditingId, payload);
			} else {
				await createFeaturedListing(payload);
			}

			resetForm();
			await loadListings();

			return {
				errorMessage: null,
				statusMessage: isEditing ? "Featured listing updated" : "Featured listing created",
			};
		} catch (error) {
			const message = getErrorMessage(error);
			log.error("Failed to save featured listing", error);
			return {
				errorMessage: message,
				statusMessage: null,
			};
		}
	}, INITIAL_SUBMIT_STATE);

	const isMutating = isSubmitting || isPending;
	const currentImageUrl = formState.imageUrl.trim();
	const hasSelectedImage = currentImageUrl.length > 0;
	const isEditing = Boolean(editingId);
	const isEditingWithCurrentSavedImage = Boolean(isEditing && originalEditImageUrl && currentImageUrl === originalEditImageUrl);
	const hasUnsavedReplacementImage = Boolean(isEditing && originalEditImageUrl && hasSelectedImage && currentImageUrl !== originalEditImageUrl);
	const canUploadImage = !isMutating && !isUploadingImage && (!hasSelectedImage || isEditingWithCurrentSavedImage);

	useEffect(() => {
		const controller = new AbortController();
		void loadListings(controller.signal);

		return () => {
			controller.abort();
		};
	}, []);

	useEffect(() => {
		setErrorMessage(actionState.errorMessage);
		setStatusMessage(actionState.statusMessage);
	}, [actionState]);

	/**
	 * Resets the form to its initial empty state and clears editing state.
	 * @returns {void}
	 */
	const resetForm = () => {
		setFormState(EMPTY_FORM);
		setEditingId(null);
		setOriginalEditImageUrl(null);
		formStateRef.current = EMPTY_FORM;
		editingIdRef.current = null;
		setIsUploadingImage(false);
	};

	/**
	 * Updates a specific field in the form state and synchronizes the ref.
	 * @param {keyof FeaturedListingFormState} field - The field to update.
	 * @param {string} value - The new value for the field.
	 * @returns {void}
	 */
	const onFieldChange = (field: keyof FeaturedListingFormState, value: string) => {
		setFormState((current) => {
			const nextState = {
				...current,
				[field]: value,
			};
			formStateRef.current = nextState;
			return nextState;
		});
	};

	/**
	 * Populates the form with an existing listing's data for editing.
	 * @param {FeaturedListing} listing - The listing to edit.
	 * @returns {void}
	 */
	const handleEdit = (listing: FeaturedListing) => {
		setEditingId(listing.id);
		const nextFormState = toFormState(listing);
		setFormState(nextFormState);
		formStateRef.current = nextFormState;
		editingIdRef.current = listing.id;
		setOriginalEditImageUrl(listing.imageUrl);
		setIsUploadingImage(false);
		setErrorMessage(null);
		setStatusMessage(null);
	};

	/**
	 * Deletes a featured listing after user confirmation.
	 * @async
	 * @param {FeaturedListing} listing - The listing to delete.
	 * @returns {Promise<void>} Resolves when the deletion is complete.
	 */
	const handleDelete = async (listing: FeaturedListing) => {
		const shouldDelete = window.confirm(`Delete featured listing at ${listing.address}?`);
		if (!shouldDelete) {
			return;
		}

		try {
			setIsSubmitting(true);
			await deleteFeaturedListing(listing.id);
			await loadListings();

			if (editingId === listing.id) {
				resetForm();
			}

			setStatusMessage("Featured listing removed");
		} catch (error) {
			const message = getErrorMessage(error);
			log.error("Failed to delete featured listing", error);
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	/**
	 * Handles the completion of an image upload by extracting the URL and updating form state.
	 * @param {UploadedUploadThingFile[]} files - The uploaded files from UploadThing.
	 * @returns {void}
	 */
	const handleUploadComplete = (files: UploadedUploadThingFile[]) => {
		const firstFile = files[0];
		setIsUploadingImage(false);

		if (!firstFile) {
			setErrorMessage("No uploaded image was returned. Please retry.");
			return;
		}

		const uploadedImageUrl = firstFile.serverData?.url ?? firstFile.ufsUrl ?? firstFile.url;

		if (!uploadedImageUrl) {
			setErrorMessage("Uploaded image URL was not returned. Please retry.");
			return;
		}

		onFieldChange("imageUrl", uploadedImageUrl);
		setStatusMessage(isEditing ? "Replacement image uploaded. Save listing to apply the change." : "Image uploaded. Each listing supports one image only.");
		setErrorMessage(null);
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

			<div className="grid w-full max-w-full gap-6 lg:grid-cols-2 xl:gap-8">
				<CurrentFeaturedListings
					listings={listings}
					isLoading={isLoading}
					isMutating={isMutating}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>

				<FeaturedListingForm
					formAction={formAction}
					formState={formState}
					onFieldChange={onFieldChange}
					isMutating={isMutating}
					isPending={isPending}
					editingId={editingId}
					canCreateMore={canCreateMore}
					listingsCount={listings.length}
					errorMessage={errorMessage}
					statusMessage={statusMessage}
					onCancelEdit={resetForm}
					isUploadingImage={isUploadingImage}
					canUploadImage={canUploadImage}
					hasSelectedImage={hasSelectedImage}
					hasUnsavedReplacementImage={hasUnsavedReplacementImage}
					originalEditImageUrl={originalEditImageUrl}
					isEditingWithCurrentSavedImage={isEditingWithCurrentSavedImage}
					onUploadBegin={() => {
						setIsUploadingImage(true);
						setErrorMessage(null);
						setStatusMessage("Uploading image...");
					}}
					onUploadComplete={handleUploadComplete}
					onUploadError={(error) => {
						setIsUploadingImage(false);
						log.error("Featured image upload failed", error);
						setErrorMessage(error.message);
					}}
					onClearImage={() => {
						onFieldChange("imageUrl", "");
						setErrorMessage(null);
						setStatusMessage("Current image cleared. Upload one replacement image.");
						setIsUploadingImage(false);
					}}
					onRevertImage={() => {
						if (originalEditImageUrl) {
							onFieldChange("imageUrl", originalEditImageUrl);
							setErrorMessage(null);
							setStatusMessage("Reverted to the current saved image.");
							setIsUploadingImage(false);
						}
					}}
				/>
			</div>
		</section>
	);
}
