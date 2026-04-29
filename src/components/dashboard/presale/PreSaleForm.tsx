"use client";

import {useActionState, useCallback, useEffect, useRef, useState} from "react";
import {Loader2} from "lucide-react";

import {Button} from "@/components/ui/button";
import type {UploadedUploadThingFile} from "@/components/ui/file-upload";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {createLogger} from "@/lib/logger";
import {countWords} from "@/utils/string";
import {presaleInputSchema, updatePresaleInputSchema} from "@/lib/zod/presale";
import {MAX_PRESALE_IMAGES, type PresaleListing, type PresaleListingMutationInput} from "@/lib/presales/types";
import {PresalesApiError, createPresaleListing, updatePresaleListing} from "@/lib/presales/client";
import {uploadFiles} from "@/lib/uploadthing";
import {requestUploadThingFileDeletion} from "@/lib/uploadthing/cleanup";

import {PreSaleImageUpload} from "./PreSaleImageUpload";

const log = createLogger("presale-form");

const DESCRIPTION_MAX_WORDS = 100;

interface PreSaleFormState {
	title: string;
	description: string;
	price: string;
	address: string;
	bedrooms: string;
	bathrooms: string;
	squareFeet: string;
	imageUrls: string[];
	status: string;
	completion: string;
	developer: string;
	amenities: string;
}

const EMPTY_FORM: PreSaleFormState = {
	title: "",
	description: "",
	price: "",
	address: "",
	bedrooms: "",
	bathrooms: "",
	squareFeet: "",
	imageUrls: [],
	status: "",
	completion: "",
	developer: "",
	amenities: "",
};

interface PreSaleSubmitState {
	errorMessage: string | null;
	fieldErrors: Record<string, string> | null;
	statusMessage: string | null;
}

const INITIAL_SUBMIT_STATE: PreSaleSubmitState = {
	errorMessage: null,
	fieldErrors: null,
	statusMessage: null,
};

interface PendingPresaleImage {
	file: File;
	previewUrl: string;
}

function getUploadedFileUrl(file: {serverData?: {url?: string} | null; ufsUrl?: string; url?: string} | undefined): string | null {
	if (!file) {
		return null;
	}

	return file.serverData?.url ?? file.ufsUrl ?? file.url ?? null;
}

function revokePendingImagePreviews(images: PendingPresaleImage[]): void {
	for (const image of images) {
		URL.revokeObjectURL(image.previewUrl);
	}
}

interface PreSaleFormProps {
	selectedListing: PresaleListing | null;
	listingsCount: number;
	canCreateMore: boolean;
	isDeletePending: boolean;
	onListingsChange: () => Promise<void>;
	onCancelEditSelection: () => void;
}

/**
 * Converts a presale listing entity into editable form field state.
 * @param listing - The listing to map into form values.
 * @returns The form-ready listing state.
 */
function toFormState(listing: PresaleListing): PreSaleFormState {
	return {
		title: listing.title,
		description: listing.description,
		price: `${listing.price}`,
		address: listing.address,
		bedrooms: `${listing.bedrooms}`,
		bathrooms: `${listing.bathrooms}`,
		squareFeet: `${listing.squareFeet}`,
		imageUrls: [...listing.imageUrls],
		status: listing.status ?? "",
		completion: listing.completion,
		developer: listing.developer,
		amenities: listing.amenities.join(", "),
	};
}

/**
 * Builds the presale mutation payload from current form values.
 * @param form - The current form state.
 * @returns Normalized payload ready for schema validation.
 */
function buildMutationInputFromForm(form: PreSaleFormState): PresaleListingMutationInput {
	return {
		title: form.title,
		description: form.description,
		price: Number(form.price) || 0,
		address: form.address,
		bedrooms: Number(form.bedrooms) || 0,
		bathrooms: Number(form.bathrooms) || 0,
		squareFeet: Number(form.squareFeet) || 0,
		imageUrls: form.imageUrls,
		status: form.status.trim() || null,
		completion: form.completion,
		developer: form.developer,
		amenities: form.amenities
			.split(",")
			.map((amenity) => amenity.trim())
			.filter(Boolean),
	};
}

/**
 * Parses the form state into a validated create mutation payload using Zod.
 * @param form - The current form state.
 * @returns Validated payload or an object with field errors.
 */
function parseFormForCreate(form: PreSaleFormState): {data: PresaleListingMutationInput} | {errors: Record<string, string>} {
	const raw = buildMutationInputFromForm(form);

	const result = presaleInputSchema.safeParse(raw);
	if (!result.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of result.error.issues) {
			const key = issue.path.join(".");
			fieldErrors[key] ??= issue.message;
		}
		return {errors: fieldErrors};
	}

	return {data: result.data};
}

/**
 * Parses the form state into a validated update mutation payload using Zod.
 * @param form - The current form state.
 * @returns Validated partial payload or an object with field errors.
 */
function parseFormForUpdate(form: PreSaleFormState): {data: Partial<PresaleListingMutationInput>} | {errors: Record<string, string>} {
	const raw = buildMutationInputFromForm(form);

	const result = updatePresaleInputSchema.safeParse(raw);
	if (!result.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of result.error.issues) {
			const key = issue.path.join(".");
			fieldErrors[key] ??= issue.message;
		}
		return {errors: fieldErrors};
	}

	return {data: result.data};
}

/**
 * Extracts a user-friendly error message from an unknown error.
 * @param error - The error to extract a message from.
 * @returns A formatted error message string.
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof PresalesApiError) {
		return error.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "An unexpected error occurred";
}

/**
 * Form for creating and editing presale listings.
 * Handles image uploads, Zod validation, and API submissions.
 */
export function PreSaleForm({selectedListing, listingsCount, canCreateMore, isDeletePending, onListingsChange, onCancelEditSelection}: PreSaleFormProps) {
	const [formState, setFormState] = useState<PreSaleFormState>(EMPTY_FORM);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [originalEditImageUrls, setOriginalEditImageUrls] = useState<string[]>([]);
	const [pendingCreateImages, setPendingCreateImages] = useState<PendingPresaleImage[]>([]);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const pendingCreateImagesRef = useRef<PendingPresaleImage[]>([]);

	const clearImageUrlsFieldError = useCallback(() => {
		if (!fieldErrors?.imageUrls) {
			return;
		}

		setFieldErrors((prev) => {
			if (!prev) {
				return null;
			}

			const next = {...prev};
			delete next.imageUrls;
			return Object.keys(next).length > 0 ? next : null;
		});
	}, [fieldErrors]);

	const clearPendingCreateImages = useCallback(() => {
		setPendingCreateImages((current) => {
			revokePendingImagePreviews(current);
			return [];
		});
	}, []);

	/**
	 * Resets all form fields and local UI state to initial values.
	 */
	const resetFormFields = () => {
		clearPendingCreateImages();
		setFormState(EMPTY_FORM);
		setEditingId(null);
		setOriginalEditImageUrls([]);
		setIsUploadingImage(false);
		setFieldErrors(null);
	};

	const [actionState, formAction, isPending] = useActionState(async (_previousState: PreSaleSubmitState, _formData: FormData): Promise<PreSaleSubmitState> => {
		try {
			const activeEditingId = editingId;
			const isEditing = Boolean(activeEditingId);
			const currentForm = formState;

			if (isEditing && activeEditingId) {
				const parsed = parseFormForUpdate(currentForm);
				if ("errors" in parsed) {
					return {errorMessage: "Please fix the validation errors below.", fieldErrors: parsed.errors, statusMessage: null};
				}
				await updatePresaleListing(activeEditingId, parsed.data);
			} else {
				const parsed = parseFormForCreate(currentForm);
				if ("errors" in parsed) {
					return {errorMessage: "Please fix the validation errors below.", fieldErrors: parsed.errors, statusMessage: null};
				}

				const imagesToUpload = pendingCreateImagesRef.current;
				if (imagesToUpload.length === 0) {
					return {
						errorMessage: "Please select at least one image.",
						fieldErrors: {imageUrls: "At least one image is required"},
						statusMessage: null,
					};
				}

				setIsUploadingImage(true);
				setStatusMessage(`Uploading ${imagesToUpload.length} image${imagesToUpload.length > 1 ? "s" : ""}...`);

				const uploadedFiles = await uploadFiles("presaleImage", {
					files: imagesToUpload.map((image) => image.file),
				});

				const uploadedUrls = uploadedFiles.map((file) => getUploadedFileUrl(file)).filter((url): url is string => Boolean(url));

				if (uploadedUrls.length !== imagesToUpload.length) {
					throw new Error("Some image uploads did not return URLs. Please retry.");
				}

				await createPresaleListing({...parsed.data, imageUrls: uploadedUrls});
			}

			resetFormFields();
			onCancelEditSelection();
			await onListingsChange();

			return {
				errorMessage: null,
				fieldErrors: null,
				statusMessage: isEditing ? "Pre-sale listing updated" : "Pre-sale listing created",
			};
		} catch (error) {
			setIsUploadingImage(false);
			const message = getErrorMessage(error);
			log.error("Failed to save presale listing", error);
			return {errorMessage: message, fieldErrors: null, statusMessage: null};
		}
	}, INITIAL_SUBMIT_STATE);

	const isMutating = isPending || isDeletePending;
	const isEditing = Boolean(editingId);
	const formTitle = isEditing ? "Edit Pre-Sale Listing" : "Add Pre-Sale Listing";
	const descriptionWordCount = countWords(formState.description);

	useEffect(() => {
		setErrorMessage(actionState.errorMessage);
		setFieldErrors(actionState.fieldErrors);
		setStatusMessage(actionState.statusMessage);
	}, [actionState]);

	useEffect(() => {
		pendingCreateImagesRef.current = pendingCreateImages;
	}, [pendingCreateImages]);

	useEffect(() => {
		return () => {
			revokePendingImagePreviews(pendingCreateImagesRef.current);
		};
	}, []);

	useEffect(() => {
		if (!selectedListing) {
			clearPendingCreateImages();
			setFormState(EMPTY_FORM);
			setEditingId(null);
			setOriginalEditImageUrls([]);
			setIsUploadingImage(false);
			setErrorMessage(null);
			setFieldErrors(null);
			setStatusMessage(null);
			return;
		}

		clearPendingCreateImages();
		const nextFormState = toFormState(selectedListing);
		setFormState(nextFormState);
		setEditingId(selectedListing.id);
		setOriginalEditImageUrls([...selectedListing.imageUrls]);
		setIsUploadingImage(false);
		setErrorMessage(null);
		setFieldErrors(null);
		setStatusMessage(null);
	}, [clearPendingCreateImages, selectedListing]);

	/**
	 * Updates a single text field in the form state.
	 * @param field - The form field to update.
	 * @param value - The new field value.
	 */
	const onFieldChange = (field: keyof Omit<PreSaleFormState, "imageUrls">, value: string) => {
		setFormState((current) => ({...current, [field]: value}));
		// Clear field-specific error on change
		if (fieldErrors?.[field]) {
			setFieldErrors((prev) => {
				if (!prev) return null;
				const next = {...prev};
				delete next[field];
				return Object.keys(next).length > 0 ? next : null;
			});
		}
	};

	/**
	 * Handles successful image uploads by appending new URLs to the form state.
	 * @param files - Files returned by UploadThing.
	 */
	const handleUploadComplete = (files: UploadedUploadThingFile[]) => {
		setIsUploadingImage(false);

		const newUrls: string[] = [];
		for (const file of files) {
			const url = file.serverData?.url ?? file.ufsUrl ?? file.url;
			if (url) {
				newUrls.push(url);
			}
		}

		if (newUrls.length === 0) {
			setErrorMessage("No uploaded image URLs were returned. Please retry.");
			return;
		}

		setFormState((current) => ({
			...current,
			imageUrls: [...current.imageUrls, ...newUrls].slice(0, MAX_PRESALE_IMAGES),
		}));

		setStatusMessage(`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded.`);
		setErrorMessage(null);
		clearImageUrlsFieldError();
	};

	const handleSelectCreateFiles = (files: File[]) => {
		if (isEditing) {
			return;
		}

		const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
		const existingImages = pendingCreateImagesRef.current;
		const remainingSlots = MAX_PRESALE_IMAGES - existingImages.length;
		if (remainingSlots <= 0) {
			setErrorMessage(`You can upload a maximum of ${MAX_PRESALE_IMAGES} images.`);
			return;
		}

		const validFiles: File[] = [];
		let invalidTypeCount = 0;
		let oversizeCount = 0;

		for (const file of files) {
			if (!allowedMimeTypes.has(file.type)) {
				invalidTypeCount += 1;
				continue;
			}

			if (file.size > 8 * 1024 * 1024) {
				oversizeCount += 1;
				continue;
			}

			validFiles.push(file);
		}

		const filesForSelection = validFiles.slice(0, remainingSlots);
		const skippedByLimitCount = validFiles.length - filesForSelection.length;

		if (filesForSelection.length === 0) {
			if (invalidTypeCount > 0 || oversizeCount > 0) {
				setErrorMessage("Only JPG, PNG, and WebP images up to 8 MB are supported.");
			}
			return;
		}

		const pendingImagesToAdd = filesForSelection.map((file) => ({
			file,
			previewUrl: URL.createObjectURL(file),
		}));

		const nextPendingImages = [...existingImages, ...pendingImagesToAdd].slice(0, MAX_PRESALE_IMAGES);
		setPendingCreateImages(nextPendingImages);
		setFormState((current) => ({
			...current,
			imageUrls: nextPendingImages.map((image) => image.previewUrl),
		}));

		const selectedCount = pendingImagesToAdd.length;
		setStatusMessage(`${selectedCount} image${selectedCount > 1 ? "s" : ""} selected. Images upload when you create the listing.`);
		if (invalidTypeCount > 0 || oversizeCount > 0 || skippedByLimitCount > 0) {
			setErrorMessage("Some selected files were skipped due to format, size, or image limit.");
		} else {
			setErrorMessage(null);
		}
		clearImageUrlsFieldError();
	};

	/**
	 * Removes an image at a specific index from the form state.
	 * @param index - The index of the image to remove.
	 */
	const handleRemoveImage = (index: number) => {
		if (!isEditing) {
			const currentPendingImages = pendingCreateImagesRef.current;
			const removedImage = currentPendingImages[index];
			if (!removedImage) {
				return;
			}

			URL.revokeObjectURL(removedImage.previewUrl);
			const nextPendingImages = currentPendingImages.filter((_, i) => i !== index);
			setPendingCreateImages(nextPendingImages);
			pendingCreateImagesRef.current = nextPendingImages;
			setFormState((current) => ({
				...current,
				imageUrls: nextPendingImages.map((image) => image.previewUrl),
			}));
			setStatusMessage("Image removed. Images upload when you create the listing.");
			setErrorMessage(null);
			return;
		}

		const removedUrl = formState.imageUrls[index];
		if (removedUrl && !removedUrl.startsWith("blob:") && !removedUrl.startsWith("data:") && !originalEditImageUrls.includes(removedUrl)) {
			void requestUploadThingFileDeletion(removedUrl, "presale-image-replace");
		}

		setFormState((current) => ({
			...current,
			imageUrls: current.imageUrls.filter((_, i) => i !== index),
		}));
		setStatusMessage("Image removed. Save listing to persist the change.");
	};

	/**
	 * Cancels edit mode, clears form state, and resets manager selection.
	 */
	const handleCancelEdit = () => {
		resetFormFields();
		onCancelEditSelection();
	};

	/**
	 * Helper to render a field error message.
	 * @param fieldName - The field name key.
	 * @returns Error paragraph element or null.
	 */
	const renderFieldError = (fieldName: string) => {
		const error = fieldErrors?.[fieldName];
		return error ? <p className="text-xs text-red-600">{error}</p> : null;
	};

	return (
		<div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
			<h3 className="mb-4 text-lg font-semibold text-gray-900">{formTitle}</h3>
			<form
				action={formAction}
				className="max-w-full space-y-4"
			>
				{/* Title */}
				<div className="space-y-2">
					<Label htmlFor="presale-title">Title</Label>
					<Input
						id="presale-title"
						name="title"
						value={formState.title}
						onChange={(event) => onFieldChange("title", event.target.value)}
						placeholder="Modern Waterfront Condos"
						required
						disabled={isMutating}
					/>
					{renderFieldError("title")}
				</div>

				{/* Address */}
				<div className="space-y-2">
					<Label htmlFor="presale-address">Address</Label>
					<Input
						id="presale-address"
						name="address"
						value={formState.address}
						onChange={(event) => onFieldChange("address", event.target.value)}
						placeholder="1234 Ocean Dr, Vancouver, BC"
						required
						disabled={isMutating}
					/>
					{renderFieldError("address")}
				</div>

				{/* Description */}
				<div className="space-y-2">
					<Label htmlFor="presale-description">Description</Label>
					<Textarea
						id="presale-description"
						name="description"
						value={formState.description}
						onChange={(event) => onFieldChange("description", event.target.value)}
						placeholder="Describe the development's standout features and lifestyle in up to 100 words."
						maxLength={800}
						required
						disabled={isMutating}
					/>
					<p className={`text-xs ${descriptionWordCount > DESCRIPTION_MAX_WORDS ? "text-red-600" : "text-gray-500"}`}>
						{descriptionWordCount}/{DESCRIPTION_MAX_WORDS} words
					</p>
					{renderFieldError("description")}
				</div>

				{/* Price + Square Feet (side by side on sm+) */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="presale-price">Price (CAD)</Label>
						<Input
							id="presale-price"
							name="price"
							inputMode="numeric"
							value={formState.price}
							onChange={(event) => onFieldChange("price", event.target.value)}
							placeholder="899000"
							required
							disabled={isMutating}
						/>
						{renderFieldError("price")}
					</div>

					<div className="space-y-2">
						<Label htmlFor="presale-sqft">Square Feet</Label>
						<Input
							id="presale-sqft"
							name="squareFeet"
							inputMode="numeric"
							value={formState.squareFeet}
							onChange={(event) => onFieldChange("squareFeet", event.target.value)}
							placeholder="1200"
							required
							disabled={isMutating}
						/>
						{renderFieldError("squareFeet")}
					</div>
				</div>

				{/* Bedrooms + Bathrooms */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="presale-bedrooms">Bedrooms</Label>
						<Input
							id="presale-bedrooms"
							name="bedrooms"
							inputMode="numeric"
							value={formState.bedrooms}
							onChange={(event) => onFieldChange("bedrooms", event.target.value)}
							placeholder="2"
							required
							disabled={isMutating}
						/>
						{renderFieldError("bedrooms")}
					</div>

					<div className="space-y-2">
						<Label htmlFor="presale-bathrooms">Bathrooms</Label>
						<Input
							id="presale-bathrooms"
							name="bathrooms"
							inputMode="decimal"
							value={formState.bathrooms}
							onChange={(event) => onFieldChange("bathrooms", event.target.value)}
							placeholder="2"
							required
							disabled={isMutating}
						/>
						{renderFieldError("bathrooms")}
					</div>
				</div>

				{/* Developer + Completion */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="presale-developer">Developer</Label>
						<Input
							id="presale-developer"
							name="developer"
							value={formState.developer}
							onChange={(event) => onFieldChange("developer", event.target.value)}
							placeholder="Concord Pacific"
							required
							disabled={isMutating}
						/>
						{renderFieldError("developer")}
					</div>

					<div className="space-y-2">
						<Label htmlFor="presale-completion">Est. Completion</Label>
						<Input
							id="presale-completion"
							name="completion"
							value={formState.completion}
							onChange={(event) => onFieldChange("completion", event.target.value)}
							placeholder="Q4 2026"
							required
							disabled={isMutating}
						/>
						{renderFieldError("completion")}
					</div>
				</div>

				{/* Status */}
				<div className="space-y-2">
					<Label htmlFor="presale-status">Status (optional)</Label>
					<Input
						id="presale-status"
						name="status"
						value={formState.status}
						onChange={(event) => onFieldChange("status", event.target.value)}
						placeholder="Now Selling"
						disabled={isMutating}
					/>
					{renderFieldError("status")}
				</div>

				{/* Amenities */}
				<div className="space-y-2">
					<Label htmlFor="presale-amenities">Amenities (comma-separated)</Label>
					<Textarea
						id="presale-amenities"
						name="amenities"
						value={formState.amenities}
						onChange={(event) => onFieldChange("amenities", event.target.value)}
						placeholder="Rooftop deck, Concierge, Gym, EV charging"
						disabled={isMutating}
					/>
					<p className="text-xs text-gray-500">Separate each amenity with a comma. Max 20 amenities.</p>
					{renderFieldError("amenities")}
				</div>

				{/* Image Upload */}
				<PreSaleImageUpload
					imageUrls={formState.imageUrls}
					disabled={isMutating}
					isUploading={isUploadingImage}
					deferUpload={!isEditing}
					onSelectFiles={isEditing ? undefined : handleSelectCreateFiles}
					onUploadBegin={
						isEditing
							? () => {
									setIsUploadingImage(true);
									setErrorMessage(null);
									setStatusMessage("Uploading image...");
								}
							: undefined
					}
					onUploadComplete={isEditing ? handleUploadComplete : undefined}
					onUploadError={
						isEditing
							? (error: Error) => {
									setIsUploadingImage(false);
									log.error("Presale image upload failed", error);
									setErrorMessage(error.message);
								}
							: undefined
					}
					onRemoveImage={handleRemoveImage}
				/>
				{renderFieldError("imageUrls")}

				{/* Action buttons */}
				<div className="flex flex-wrap gap-2 pt-2">
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

				{!canCreateMore && !editingId && <p className="text-sm text-amber-600">Max pre-sale listings reached. Delete one to create another.</p>}

				{errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
				{statusMessage && <p className="text-sm text-emerald-600">{statusMessage}</p>}
			</form>
		</div>
	);
}
