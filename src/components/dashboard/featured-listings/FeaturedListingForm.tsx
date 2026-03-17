import {useActionState, useEffect, useRef, useState, type JSX} from "react";
import {Loader2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import type {UploadedUploadThingFile} from "@/components/ui/file-upload";
import {createLogger} from "@/lib/logger";
import {countWords} from "@/lib/utils/string";
import {parseFeaturedListingFormInput} from "@/lib/zod/featured-listing-form";
import {type FeaturedListing, type FeaturedListingMutationInput} from "@/lib/featured-listings/types";
import {FeaturedListingsApiError, createFeaturedListing, updateFeaturedListing} from "@/lib/featured-listings/client";

import {FeaturedListingImageUpload} from "./FeaturedListingImageUpload";
import type {FeaturedListingFormState, FeaturedListingSubmitState} from "./types";
import {MAX_DESCRIPTION_WORDS} from "@/lib/constants/featured-listing";

const log = createLogger("dashboard-featured-listings-form");

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

interface FeaturedListingFormProps {
	selectedListing: FeaturedListing | null;
	listingsCount: number;
	canCreateMore: boolean;
	isDeletePending: boolean;
	onListingsChange: () => Promise<void>;
	onCancelEditSelection: () => void;
}

/**
 * Converts a featured listing entity into editable form field state.
 * @param {FeaturedListing} listing - The listing to map into form values.
 * @returns {FeaturedListingFormState} The form-ready listing state.
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
 * Parses featured listing form state into a validated mutation payload.
 * @param {FeaturedListingFormState} form - The form state submitted by the user.
 * @returns {FeaturedListingMutationInput} The validated payload for create or update requests.
 * @throws {Error} Throws when the form values fail schema validation.
 */
function buildMutationInput(form: FeaturedListingFormState): FeaturedListingMutationInput {
	return parseFeaturedListingFormInput(form);
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
 * Renders the create/edit form and manages all featured listing form interactions.
 * @param {FeaturedListingFormProps} props - The component props.
 * @returns {JSX.Element} The rendered form panel.
 */
export function FeaturedListingForm({selectedListing, listingsCount, canCreateMore, isDeletePending, onListingsChange, onCancelEditSelection}: FeaturedListingFormProps): JSX.Element {
	const [formState, setFormState] = useState<FeaturedListingFormState>(EMPTY_FORM);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [originalEditImageUrl, setOriginalEditImageUrl] = useState<string | null>(null);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const formStateRef = useRef<FeaturedListingFormState>(EMPTY_FORM);
	const editingIdRef = useRef<string | null>(null);

	/**
	 * Resets all editable fields and local form-only UI state.
	 * @returns {void}
	 */
	const resetFormFields = () => {
		setFormState(EMPTY_FORM);
		setEditingId(null);
		setOriginalEditImageUrl(null);
		formStateRef.current = EMPTY_FORM;
		editingIdRef.current = null;
		setIsUploadingImage(false);
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

			resetFormFields();
			onCancelEditSelection();
			await onListingsChange();

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

	const isMutating = isPending || isDeletePending;
	const currentImageUrl = formState.imageUrl.trim();
	const hasSelectedImage = currentImageUrl.length > 0;
	const isEditing = Boolean(editingId);
	const isEditingWithCurrentSavedImage = Boolean(isEditing && originalEditImageUrl && currentImageUrl === originalEditImageUrl);
	const hasUnsavedReplacementImage = Boolean(isEditing && originalEditImageUrl && hasSelectedImage && currentImageUrl !== originalEditImageUrl);
	const canUploadImage = !isMutating && !isUploadingImage && (!hasSelectedImage || isEditingWithCurrentSavedImage);
	const formTitle = isEditing ? "Edit Featured Listing" : "Add Featured Listing";
	const descriptionWordCount = countWords(formState.description);

	useEffect(() => {
		setErrorMessage(actionState.errorMessage);
		setStatusMessage(actionState.statusMessage);
	}, [actionState]);

	useEffect(() => {
		if (!selectedListing) {
			setFormState(EMPTY_FORM);
			setEditingId(null);
			setOriginalEditImageUrl(null);
			formStateRef.current = EMPTY_FORM;
			editingIdRef.current = null;
			setIsUploadingImage(false);
			return;
		}

		const nextFormState = toFormState(selectedListing);
		setFormState(nextFormState);
		setEditingId(selectedListing.id);
		setOriginalEditImageUrl(selectedListing.imageUrl);
		formStateRef.current = nextFormState;
		editingIdRef.current = selectedListing.id;
		setIsUploadingImage(false);
		setErrorMessage(null);
		setStatusMessage(null);
	}, [selectedListing]);

	/**
	 * Updates a single field in the form and keeps the mutable snapshot in sync.
	 * @param {keyof FeaturedListingFormState} field - The form field to update.
	 * @param {string} value - The new field value.
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
	 * Handles successful image uploads and applies the uploaded URL to the form.
	 * @param {UploadedUploadThingFile[]} files - Files returned by UploadThing.
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

	/**
	 * Cancels edit mode, clears local form state, and resets manager selection.
	 * @returns {void}
	 */
	const handleCancelEdit = () => {
		resetFormFields();
		onCancelEditSelection();
	};

	return (
		<div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
			<h3 className="mb-4 text-lg font-semibold text-gray-900">{formTitle}</h3>
			<form
				action={formAction}
				className="max-w-full space-y-4"
			>
				<div className="space-y-2">
					<Label htmlFor="featured-title">Title</Label>
					<Input
						id="featured-title"
						name="title"
						value={formState.title}
						onChange={(event) => onFieldChange("title", event.target.value)}
						placeholder="Oceanview Family Home"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="featured-address">Address</Label>
					<Input
						id="featured-address"
						name="address"
						value={formState.address}
						onChange={(event) => onFieldChange("address", event.target.value)}
						placeholder="1234 Ocean Dr, Vancouver, BC"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="featured-description">Brief Description</Label>
					<Textarea
						id="featured-description"
						name="description"
						value={formState.description}
						onChange={(event) => onFieldChange("description", event.target.value)}
						placeholder="Describe the home's standout features and lifestyle in up to 50 words."
						maxLength={400}
						required
					/>
					<p className={`text-xs ${descriptionWordCount > MAX_DESCRIPTION_WORDS ? "text-red-600" : "text-gray-500"}`}>
						{descriptionWordCount}/{MAX_DESCRIPTION_WORDS} words
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="featured-price">Price (CAD)</Label>
						<Input
							id="featured-price"
							name="price"
							inputMode="numeric"
							value={formState.price}
							onChange={(event) => onFieldChange("price", event.target.value)}
							placeholder="1250000"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="featured-sqft">Square Feet</Label>
						<Input
							id="featured-sqft"
							name="squareFeet"
							inputMode="numeric"
							value={formState.squareFeet}
							onChange={(event) => onFieldChange("squareFeet", event.target.value)}
							placeholder="2800"
							required
						/>
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="featured-bedrooms">Bedrooms</Label>
						<Input
							id="featured-bedrooms"
							name="bedrooms"
							inputMode="numeric"
							value={formState.bedrooms}
							onChange={(event) => onFieldChange("bedrooms", event.target.value)}
							placeholder="4"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="featured-bathrooms">Bathrooms</Label>
						<Input
							id="featured-bathrooms"
							name="bathrooms"
							inputMode="decimal"
							value={formState.bathrooms}
							onChange={(event) => onFieldChange("bathrooms", event.target.value)}
							placeholder="2.5"
							required
						/>
					</div>
				</div>

				<FeaturedListingImageUpload
					imageUrl={formState.imageUrl}
					isEditing={isEditing}
					isMutating={isMutating}
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

				<div className="flex flex-wrap gap-2">
					<Button
						type="submit"
						disabled={isMutating || isUploadingImage || (!editingId && !canCreateMore && listingsCount > 0)}
					>
						{isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Saving...
							</>
						) : editingId ? (
							"Update Listing"
						) : (
							"Create Listing"
						)}
					</Button>

					{editingId && (
						<Button
							type="button"
							variant="outline"
							onClick={handleCancelEdit}
							disabled={isMutating}
						>
							Cancel Edit
						</Button>
					)}
				</div>

				{!canCreateMore && !editingId && <p className="text-sm text-amber-600">Max featured listings reached. Delete one to create another.</p>}

				{errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
				{statusMessage && <p className="text-sm text-emerald-600">{statusMessage}</p>}
			</form>
		</div>
	);
}
