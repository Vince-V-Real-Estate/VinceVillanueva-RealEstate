import {Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {FeaturedListingImageUpload} from "./FeaturedListingImageUpload";
import type {FeaturedListingFormState} from "./types";

import type {UploadedUploadThingFile} from "@/components/ui/file-upload";
import {countWords} from "@/lib/utils/string";
import type {JSX} from "react";

const MAX_DESCRIPTION_WORDS = 50;

interface FeaturedListingFormProps {
	formAction: (payload: FormData) => void;
	formState: FeaturedListingFormState;
	onFieldChange: (field: keyof FeaturedListingFormState, value: string) => void;
	isMutating: boolean;
	isPending: boolean;
	editingId: string | null;
	canCreateMore: boolean;
	listingsCount: number;
	errorMessage: string | null;
	statusMessage: string | null;
	onCancelEdit: () => void;

	// Image Upload Props
	isUploadingImage: boolean;
	canUploadImage: boolean;
	hasSelectedImage: boolean;
	hasUnsavedReplacementImage: boolean;
	originalEditImageUrl: string | null;
	isEditingWithCurrentSavedImage: boolean;
	onUploadBegin: () => void;
	onUploadComplete: (files: UploadedUploadThingFile[]) => void;
	onUploadError: (error: Error) => void;
	onClearImage: () => void;
	onRevertImage: () => void;
}

/**
 * Renders the form for creating or editing a featured listing.
 * @param {FeaturedListingFormProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function FeaturedListingForm({
	formAction,
	formState,
	onFieldChange,
	isMutating,
	isPending,
	editingId,
	canCreateMore,
	listingsCount,
	errorMessage,
	statusMessage,
	onCancelEdit,
	isUploadingImage,
	canUploadImage,
	hasSelectedImage,
	hasUnsavedReplacementImage,
	originalEditImageUrl,
	isEditingWithCurrentSavedImage,
	onUploadBegin,
	onUploadComplete,
	onUploadError,
	onClearImage,
	onRevertImage,
}: FeaturedListingFormProps): JSX.Element {
	const formTitle = editingId ? "Edit Featured Listing" : "Add Featured Listing";
	const descriptionWordCount = countWords(formState.description);

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
					isEditing={Boolean(editingId)}
					isMutating={isMutating}
					isUploadingImage={isUploadingImage}
					canUploadImage={canUploadImage}
					hasSelectedImage={hasSelectedImage}
					hasUnsavedReplacementImage={hasUnsavedReplacementImage}
					originalEditImageUrl={originalEditImageUrl}
					isEditingWithCurrentSavedImage={isEditingWithCurrentSavedImage}
					onUploadBegin={onUploadBegin}
					onUploadComplete={onUploadComplete}
					onUploadError={onUploadError}
					onClearImage={onClearImage}
					onRevertImage={onRevertImage}
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
							onClick={onCancelEdit}
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
