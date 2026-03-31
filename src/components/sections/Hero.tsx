"use client";

import * as React from "react";
import Image from "next/image";
import {Search} from "lucide-react";
import {searchSchema} from "@/lib/zod/search-validation";
import {createLogger} from "@/lib/logger";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import MLSSearchBar from "../forms/MLSSearchBar";

const log = createLogger("search");

export function Hero() {
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
			className="relative flex min-h-[60vh] w-full flex-col justify-end overflow-hidden bg-white md:min-h-[85vh] xl:mx-auto xl:w-[90%]"
		>
			<div className="absolute inset-0 z-0 hidden md:block">
				<Image
					src="/vv-asset-2-desktop.png"
					alt="Vince Villanueva Real Estate Background"
					fill
					className="object-contain object-bottom"
					priority
				/>
			</div>
			<div className="absolute inset-0 z-0 block md:hidden">
				<Image
					src="/vv-asset-2-mobile.png"
					alt="Vince Villanueva Real Estate Background"
					fill
					className="object-contain object-top"
					priority
				/>
			</div>

			<div className="relative z-10 container mx-auto px-4 pb-12 md:px-6 md:pb-24">
				<div className="flex flex-col items-center space-y-4 text-center">
					<div className="w-full space-y-2 rounded-xl bg-neutral-300 p-5 shadow-md sm:bg-neutral-600 xl:my-5">
						<form
							action={formAction}
							className="flex w-full flex-col gap-2 rounded-md sm:flex-row sm:items-center"
						>
							<MLSSearchBar />
							<Button
								type="submit"
								disabled={isPending}
								className={cn("group relative h-10 overflow-hidden bg-black px-8 text-white hover:bg-gray-800 sm:h-12 sm:px-12", isPending && "opacity-50")}
							>
								<span className="absolute -top-[150%] left-0 inline-flex w-80 rounded-md bg-neutral-400 opacity-50 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] shadow-neutral-400 duration-500 group-hover:top-[150%]"></span>
								<Search className="mr-2 h-4 w-4" />
								{isPending ? "Searching..." : "Search"}
							</Button>
						</form>
						{actionState.errors.location && (
							<div className="rounded-md bg-white/5 p-2">
								<p className="text-sm text-red-500">{actionState.errors.location}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
