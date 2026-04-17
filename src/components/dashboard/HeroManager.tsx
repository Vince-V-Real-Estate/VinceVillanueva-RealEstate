"use client";

import {useCallback, useEffect, useState} from "react";

import {HeroImageApiError, fetchHeroImage, updateHeroImage} from "@/lib/hero-image/client";
import {type HeroImage} from "@/lib/hero-image/types";
import {createLogger} from "@/lib/logger";

import {HeroImageForm} from "./hero/HeroImageForm";

const log = createLogger("dashboard-hero");

/**
 * Extracts a user-friendly error message from an unknown error object.
 * @param {unknown} error - The error to extract a message from.
 * @returns {string} The formatted error message.
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof HeroImageApiError) return error.message;
	if (error instanceof Error) return error.message;
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
 * Dashboard panel that lets admins manage the hero section background
 * image. A single uploaded image is served for both desktop and mobile
 * viewports; when no image is uploaded, the bundled default assets are
 * used instead.
 * @returns {JSX.Element} The rendered hero manager UI.
 */
export default function HeroManager() {
	const [heroImage, setHeroImage] = useState<HeroImage | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const loadHeroImage = useCallback(async (signal?: AbortSignal) => {
		try {
			const data = await fetchHeroImage({signal});
			setHeroImage(data);
			setErrorMessage(null);
		} catch (error) {
			if (isAbortError(error)) return;
			log.error("Failed to load hero image", error);
			setErrorMessage(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		void loadHeroImage(controller.signal);
		return () => controller.abort();
	}, [loadHeroImage]);

	const handleReplace = useCallback(async (url: string) => {
		setIsSaving(true);
		setErrorMessage(null);
		try {
			const updated = await updateHeroImage({imageUrl: url});
			setHeroImage(updated);
		} catch (error) {
			log.error("Failed to update hero image", error);
			setErrorMessage(getErrorMessage(error));
		} finally {
			setIsSaving(false);
		}
	}, []);

	const handleRevertToDefault = useCallback(async () => {
		const confirmed = window.confirm("Revert the hero image to the default? This will remove the uploaded image.");
		if (!confirmed) return;

		setIsSaving(true);
		setErrorMessage(null);
		try {
			const updated = await updateHeroImage({imageUrl: null});
			setHeroImage(updated);
		} catch (error) {
			log.error("Failed to revert hero image", error);
			setErrorMessage(getErrorMessage(error));
		} finally {
			setIsSaving(false);
		}
	}, []);

	return (
		<section className="w-full max-w-full space-y-6 overflow-x-hidden">
			<div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900">Hero Image</h2>
					<p className="mt-1 text-sm text-gray-500">Upload a single image used as the homepage hero background for both desktop and mobile. When no image is uploaded, the bundled default assets are used.</p>
				</div>
				{heroImage && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">Last updated {new Date(heroImage.updatedAt).toLocaleString()}</span>}
			</div>

			{errorMessage && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p>}

			{isLoading || !heroImage ? (
				<div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">Loading hero image...</div>
			) : (
				<HeroImageForm
					heroImage={heroImage}
					isSaving={isSaving}
					onReplace={handleReplace}
					onRevertToDefault={handleRevertToDefault}
				/>
			)}
		</section>
	);
}
