"use client";

import * as React from "react";
import Image from "next/image";
import {Search} from "lucide-react";
import {searchSchema} from "@/lib/zod/search-validation";
import {createLogger} from "@/lib/logger";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {resolveHeroImageUrl} from "@/lib/hero-image/types";
import MLSSearchBar from "../forms/MLSSearchBar";

const log = createLogger("search");

interface HeroProps {
	initialImageUrl: string | null;
}

export function Hero({initialImageUrl}: HeroProps) {
	const desktopImageUrl = resolveHeroImageUrl(initialImageUrl, "desktop");
	const mobileImageUrl = resolveHeroImageUrl(initialImageUrl, "mobile");

	const initialState = {
		errors: {} as {
			location?: string;
		},
	};

	const [actionState, formAction, isPending] = React.useActionState(async (_prevState: typeof initialState, formData: FormData) => {
		const locationValue = formData.get("location");
		const data = {
			location: typeof locationValue === "string" ? locationValue : "",
		};

		const result = searchSchema.safeParse(data);

		if (!result.success) {
			const fieldErrors: typeof initialState.errors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof typeof initialState.errors;
				fieldErrors[field] = issue.message;
			}
			return {errors: fieldErrors};
		}

		// TODO: Implement search logic
		log.info("Search data", result.data);
		return {errors: {}};
	}, initialState);

	return (
		<section
			id="hero-cta"
			className="relative flex w-full flex-col bg-neutral-50 xl:mx-auto xl:w-[90%] 2xl:mt-5"
		>
			<div className="relative h-[65vh] min-h-[400px] w-full overflow-hidden md:h-[75vh] lg:min-h-[80vh]">
				{/* Desktop Image */}
				<Image
					src={desktopImageUrl}
					alt="Vince Villanueva Real Estate Background"
					fill
					className="hidden object-cover object-center md:block"
					priority
					unoptimized={desktopImageUrl.startsWith("blob:")}
				/>
				{/* Mobile Image */}
				<Image
					src={mobileImageUrl}
					alt="Vince Villanueva Real Estate Background"
					fill
					className="block object-cover object-center md:hidden"
					priority
					unoptimized={mobileImageUrl.startsWith("blob:")}
				/>
			</div>

			{/* Container for Search Bar (Below Image) */}
			<div className="relative z-10 -mt-6 flex w-full justify-center rounded-t-3xl bg-white px-4 py-8 shadow-sm md:-mt-10 md:py-12">
				<div className="w-full max-w-4xl space-y-2">
					<form
						action={formAction}
						className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
					>
						<div className="flex-1">
							<MLSSearchBar />
						</div>
						<Button
							type="submit"
							disabled={isPending}
							className={cn("group relative h-12 w-full overflow-hidden bg-black px-8 text-white transition-colors hover:bg-gray-800 sm:w-auto", isPending && "opacity-50")}
						>
							<span className="absolute -top-[150%] left-0 inline-flex w-80 rounded-md bg-neutral-400 opacity-20 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] shadow-neutral-400 duration-500 group-hover:top-[150%]"></span>
							<Search className="relative z-10 mr-2 h-5 w-5" />
							{isPending ? <span className="relative z-10 text-base font-semibold">Searching...</span> : <span className="relative z-10 text-base font-semibold">Search MLS®</span>}
						</Button>
					</form>
					{actionState.errors.location && (
						<div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2">
							<p className="text-sm text-red-600">{actionState.errors.location}</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
