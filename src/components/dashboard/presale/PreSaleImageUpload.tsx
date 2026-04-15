"use client";

import Image from "next/image";
import {X} from "lucide-react";

import {FileUpload} from "@/components/ui/file-upload";
import type {UploadedUploadThingFile} from "@/components/ui/file-upload";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {MAX_PRESALE_IMAGES} from "@/lib/presales/types";

interface PreSaleImageUploadProps {
	imageUrls: string[];
	disabled: boolean;
	isUploading: boolean;
	onUploadBegin: () => void;
	onUploadComplete: (files: UploadedUploadThingFile[]) => void;
	onUploadError: (error: Error) => void;
	onRemoveImage: (index: number) => void;
}

/**
 * Multi-image upload component for presale listings.
 * Supports 1-3 images with individual preview and removal.
 * Mobile-first layout with responsive grid for thumbnails.
 */
export function PreSaleImageUpload({imageUrls, disabled, isUploading, onUploadBegin, onUploadComplete, onUploadError, onRemoveImage}: PreSaleImageUploadProps) {
	const canUploadMore = imageUrls.length < MAX_PRESALE_IMAGES && !disabled && !isUploading;
	const remainingSlots = MAX_PRESALE_IMAGES - imageUrls.length;

	return (
		<div className="space-y-3">
			<Label>
				Listing Images ({imageUrls.length}/{MAX_PRESALE_IMAGES})
			</Label>

			{/* Image previews - responsive grid: 1 col on mobile, 3 on sm+ */}
			{imageUrls.length > 0 && (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{imageUrls.map((url, index) => (
						<div
							key={url}
							className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
						>
							<div className="relative aspect-[4/3] w-full">
								<Image
									src={url}
									alt={`Presale image ${index + 1}`}
									fill
									className="object-cover"
									sizes="(max-width: 640px) 100vw, 33vw"
								/>
							</div>
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="absolute top-2 right-2 h-7 w-7 rounded-full p-0 opacity-80 shadow-md transition-opacity group-hover:opacity-100"
								onClick={() => onRemoveImage(index)}
								disabled={disabled}
								aria-label={`Remove image ${index + 1}`}
							>
								<X className="h-4 w-4" />
							</Button>
							<span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
								{index + 1}/{imageUrls.length}
							</span>
						</div>
					))}
				</div>
			)}

			{/* Upload area - only shown when slots are available */}
			{canUploadMore ? (
				<FileUpload
					className="mx-auto w-full sm:w-auto"
					endpoint="presaleImage"
					disabled={!canUploadMore}
					onUploadBegin={onUploadBegin}
					onUploadComplete={onUploadComplete}
					onUploadError={onUploadError}
					uploadLabel={imageUrls.length === 0 ? "Upload images for this listing" : `Upload ${remainingSlots} more image${remainingSlots > 1 ? "s" : ""}`}
					uploadHelpText={`${imageUrls.length === 0 ? "At least 1 image required." : ""} Max ${MAX_PRESALE_IMAGES} images, up to 8 MB each.`}
					mobileButtonText={isUploading ? "Uploading..." : imageUrls.length === 0 ? "Upload images" : `Upload more (${remainingSlots} left)`}
				/>
			) : imageUrls.length >= MAX_PRESALE_IMAGES ? (
				<p className="text-xs text-gray-500">Maximum of {MAX_PRESALE_IMAGES} images reached. Remove an image to upload a replacement.</p>
			) : null}

			{imageUrls.length === 0 && !isUploading && <p className="text-xs text-amber-600">At least 1 image is required to save this listing.</p>}
		</div>
	);
}
