import {type ChangeEvent, useRef} from "react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {FileUpload} from "@/components/ui/file-upload";
import {IMAGE_ACCEPT_ATTRIBUTE} from "@/lib/uploadthing/constants";

import type {UploadedUploadThingFile} from "@/components/ui/file-upload";

interface FeaturedListingImageUploadProps {
	imageUrl: string;
	isEditing: boolean;
	isMutating: boolean;
	isUploadingImage: boolean;
	canUploadImage: boolean;
	hasSelectedImage: boolean;
	hasUnsavedReplacementImage: boolean;
	originalEditImageUrl: string | null;
	isEditingWithCurrentSavedImage: boolean;
	deferUpload: boolean;
	onSelectFiles?: (files: File[]) => void;
	onUploadBegin?: () => void;
	onUploadComplete?: (files: UploadedUploadThingFile[]) => void;
	onUploadError?: (error: Error) => void;
	onClearImage: () => void;
	onRevertImage: () => void;
}

export function FeaturedListingImageUpload({
	imageUrl,
	isEditing,
	isMutating,
	isUploadingImage,
	canUploadImage,
	hasSelectedImage,
	hasUnsavedReplacementImage,
	originalEditImageUrl,
	isEditingWithCurrentSavedImage,
	deferUpload,
	onSelectFiles,
	onUploadBegin,
	onUploadComplete,
	onUploadError,
	onClearImage,
	onRevertImage,
}: FeaturedListingImageUploadProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
		if (selectedFiles.length === 0) {
			return;
		}

		onSelectFiles?.([selectedFiles[0]!]);
		event.currentTarget.value = "";
	};

	return (
		<div className="space-y-2">
			<Label>Listing Image</Label>
			<input
				type="hidden"
				name="imageUrl"
				value={imageUrl}
			/>
			{deferUpload ? (
				<>
					<input
						ref={fileInputRef}
						type="file"
						accept={IMAGE_ACCEPT_ATTRIBUTE}
						onChange={handleSelectFile}
						disabled={!canUploadImage}
						className="hidden"
					/>
					<Button
						type="button"
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
						disabled={!canUploadImage}
					>
						Select image
					</Button>
					<p className="text-xs text-gray-500">The image uploads only when you create the listing. JPG, PNG, or WebP up to 8 MB.</p>
				</>
			) : (
				<FileUpload
					className="mx-auto my-8 w-55 sm:w-auto md:my-2"
					endpoint="featuredListingImage"
					disabled={!canUploadImage}
					onUploadBegin={onUploadBegin}
					onUploadComplete={(files) => onUploadComplete?.(files)}
					onUploadError={(error) => onUploadError?.(error)}
					uploadLabel="Upload one image for this listing"
					uploadHelpText={
						isEditing
							? hasUnsavedReplacementImage
								? "Replacement selected. Save listing to replace the old image in the database and UploadThing."
								: "This listing has one image. Upload one replacement, then save."
							: "Each listing allows one image total. To change it later, edit the listing, upload a replacement image, and save."
					}
					mobileButtonText={isUploadingImage ? "Uploading..." : isEditing ? "Upload replacement image" : "Upload one image"}
				/>
			)}
			{imageUrl && (
				<div className="relative mt-2 h-36 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-100">
					<Image
						src={imageUrl}
						alt="Uploaded featured listing"
						fill
						className="object-cover"
						unoptimized={imageUrl.startsWith("blob:")}
					/>
				</div>
			)}
			{!isEditing && hasSelectedImage && (
				<Button
					type="button"
					variant="outline"
					onClick={onClearImage}
					disabled={isMutating}
				>
					Replace Uploaded Image
				</Button>
			)}
			{isEditing && hasUnsavedReplacementImage && originalEditImageUrl && (
				<Button
					type="button"
					variant="outline"
					onClick={onRevertImage}
					disabled={isMutating}
				>
					Undo Replacement
				</Button>
			)}
			{isEditing && isEditingWithCurrentSavedImage && <p className="text-xs text-gray-500">Upload one replacement image, then click Update Listing.</p>}
			{isEditing && hasUnsavedReplacementImage && <p className="text-xs text-gray-500">Replacing and saving removes the previous image from UploadThing.</p>}
		</div>
	);
}
