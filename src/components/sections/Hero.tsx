"use client";

import * as React from "react";
import {Search} from "lucide-react";
import {searchSchema} from "@/lib/zod/search-validation";
import {createLogger} from "@/lib/logger";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

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
			className="relative w-full py-12 md:py-24 lg:py-32 xl:mx-auto xl:w-[90%] xl:py-65"
		>
			<div className="container mx-auto px-4 md:px-6">
				<div className="flex flex-col items-center space-y-4 text-center">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
							Vince Villanueva <span className="block text-white">Realtor</span>
						</h1>
					</div>
					<div className="w-full max-w-3xl space-y-2 xl:my-5">
						<form
							action={formAction}
							className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
						>
							<Input
								name="location"
								type="text"
								placeholder="City, Neighborhood, Address or MLS® Number"
								className="w-full flex-1 bg-white"
							/>
							<Button
								type="submit"
								disabled={isPending}
								className={cn("bg-white text-black hover:bg-gray-200", isPending && "opacity-50")}
							>
								<Search className="mr-2 h-4 w-4" />
								{isPending ? "Searching..." : "Search"}
							</Button>
						</form>
						{actionState.errors.location && (
							<div className="rounded-md bg-white/90 p-2">
								<p className="text-sm text-red-500">{actionState.errors.location}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
