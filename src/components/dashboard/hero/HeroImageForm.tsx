"use client";

import Image from "next/image";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {FileUpload, type UploadedUploadThingFile} from "@/components/ui/file-upload";
import {createLogger} from "@/lib/logger";
import {DEFAULT_HERO_DESKTOP_IMAGE_URL, DEFAULT_HERO_MOBILE_IMAGE_URL, type HeroImage} from "@/lib/hero-image/types";
import {getUploadedFileUrl} from "@/lib/uploadthing/file-url";

const log = createLogger("hero-image-form");

interface HeroImageFormProps {
	heroImage: HeroImage;
	isSaving: boolean;
	onReplace: (url: string) => Promise<void>;
	onRevertToDefault: () => Promise<void>;
	onError: (message: string) => void;
}

/**
 * Form panel for the hero section image. Uses a single uploader: the
 * uploaded image is served for both desktop and mobile viewports.
 * When no image is uploaded, the bundled default assets are used.
 * @param {HeroImageFormProps} props - Component props.
 * @returns {JSX.Element} The rendered form panel.
 */
export function HeroImageForm({heroImage, isSaving, onReplace, onRevertToDefault, onError}: HeroImageFormProps) {
	const [isUploading, setIsUploading] = useState(false);
	const storedUrl = heroImage.imageUrl;
	const usingDefault = !storedUrl;

	const handleUploadComplete = async (files: UploadedUploadThingFile[]) => {
		setIsUploading(false);
		const url = getUploadedFileUrl(files[0]);
		if (!url) {
			log.warn("Upload completed with no URL");
			return;
		}
		await onReplace(url);
	};

	const handleUploadError = (error: Error) => {
		setIsUploading(false);
		log.error("Hero image upload failed", error);
		onError(`Upload failed: ${error.message}`);
	};

	return (
		<div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
			<div className="flex items-baseline justify-between">
				<Label className="text-base font-semibold text-gray-900">Hero background image</Label>
				<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${usingDefault ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>{usingDefault ? "Using defaults" : "Custom"}</span>
			</div>

			{usingDefault ? (
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<p className="text-xs font-medium text-gray-600">Desktop default</p>
						<div className="relative h-44 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50">
							<Image
								src={DEFAULT_HERO_DESKTOP_IMAGE_URL}
								alt="Default desktop hero"
								fill
								className="object-contain object-center"
								sizes="(max-width: 768px) 100vw, 50vw"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-xs font-medium text-gray-600">Mobile default</p>
						<div className="relative h-44 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50">
							<Image
								src={DEFAULT_HERO_MOBILE_IMAGE_URL}
								alt="Default mobile hero"
								fill
								className="object-contain object-center"
								sizes="(max-width: 768px) 100vw, 50vw"
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="space-y-2">
					<p className="text-xs font-medium text-gray-600">Current image (used for desktop and mobile)</p>
					<div className="relative h-64 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50">
						<Image
							key={storedUrl}
							src={storedUrl}
							alt="Current hero image"
							fill
							className="object-cover object-center"
							sizes="100vw"
							unoptimized={storedUrl.startsWith("blob:")}
						/>
					</div>
				</div>
			)}

			<FileUpload
				endpoint="heroImage"
				disabled={isSaving || isUploading}
				onUploadBegin={() => setIsUploading(true)}
				onUploadComplete={(files) => {
					void handleUploadComplete(files);
				}}
				onUploadError={handleUploadError}
				uploadLabel="Upload a new hero image"
				uploadHelpText="JPG, PNG, or WebP up to 8 MB. The same image is used for both desktop and mobile. Replacing this image removes the previous one from UploadThing."
				mobileButtonText={isUploading ? "Uploading..." : "Upload hero image"}
			/>

			<div className="flex items-center justify-between gap-3">
				<p className="truncate text-xs text-gray-500">
					{usingDefault ? (
						<>
							Serving defaults <code className="font-mono">{DEFAULT_HERO_DESKTOP_IMAGE_URL}</code> / <code className="font-mono">{DEFAULT_HERO_MOBILE_IMAGE_URL}</code>
						</>
					) : (
						<span className="truncate">Active: {storedUrl}</span>
					)}
				</p>
				{!usingDefault && (
					<Button
						type="button"
						variant="outline"
						disabled={isSaving || isUploading}
						onClick={() => {
							void onRevertToDefault();
						}}
					>
						Revert to default
					</Button>
				)}
			</div>
		</div>
	);
}
