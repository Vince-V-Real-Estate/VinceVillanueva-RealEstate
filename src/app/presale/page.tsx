"use client";

import {useEffect, useMemo, useState} from "react";
import {Building2, Search} from "lucide-react";

import {ListingCard} from "@/components/ListingCard";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {createLogger} from "@/lib/logger";
import {fetchPresaleListings} from "@/lib/presales/client";
import {type PresaleListing} from "@/lib/presales/types";

const COMPLETION_YEAR_REGEX = /\b\d{4}\b/;
const PRESALE_IMAGE_FALLBACK = "/vv-asset-2-desktop.png";
const log = createLogger("presale-page");

/**
 * Renders the public presale listing page backed by database data.
 * @returns The interactive presale listings experience with filters and cards.
 */
export default function PresalePage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [completionFilter, setCompletionFilter] = useState("all");
	const [listings, setListings] = useState<PresaleListing[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		const loadPresaleListings = async () => {
			try {
				const {listings: loadedListings} = await fetchPresaleListings({signal: controller.signal});
				setListings(loadedListings);
				setLoadError(null);
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}

				log.error("Failed to load presale listings", error);
				setListings([]);
				setLoadError("Presale listings are temporarily unavailable.");
			} finally {
				setIsLoading(false);
			}
		};

		void loadPresaleListings();

		return () => {
			controller.abort();
		};
	}, []);

	const completionYears = useMemo(() => {
		const years = new Set(listings.map(({completion}) => COMPLETION_YEAR_REGEX.exec(completion)?.[0]).filter((year): year is string => Boolean(year)));

		return Array.from(years).sort((a, b) => Number(a) - Number(b));
	}, [listings]);

	const filteredListings = useMemo(() => {
		const normalizedSearchTerm = searchTerm.toLowerCase();

		return listings.filter((listing) => {
			const matchesSearch = listing.title.toLowerCase().includes(normalizedSearchTerm) || listing.address.toLowerCase().includes(normalizedSearchTerm);

			const matchesCompletion = completionFilter === "all" || listing.completion.includes(completionFilter);

			return matchesSearch && matchesCompletion;
		});
	}, [listings, searchTerm, completionFilter]);

	return (
		<div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
			<div className="flex flex-col gap-8">
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Building2 className="text-primary h-8 w-8" />
						<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Pre-sale Properties</h1>
					</div>
					<p className="text-muted-foreground md:text-xl">Discover exclusive early-access opportunities and upcoming developments.</p>
				</div>
				<div className="grid gap-4 md:grid-cols-[250px_1fr]">
					<div className="flex flex-col gap-4">
						<div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
							<h3 className="mb-4 font-semibold">Filters</h3>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="search">Search</Label>
									<div className="relative">
										<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
										<Input
											id="search"
											placeholder="Search location or name..."
											className="pl-9"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="completion-filter">Estimated Completion</Label>
									<Select
										value={completionFilter}
										onValueChange={(val) => setCompletionFilter(val ?? "all")}
									>
										<SelectTrigger id="completion-filter">
											<SelectValue placeholder="Select year" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Dates</SelectItem>
											{completionYears.map((year) => (
												<SelectItem
													key={year}
													value={year}
												>
													{year}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<Button
									className="w-full"
									onClick={() => {
										setSearchTerm("");
										setCompletionFilter("all");
									}}
								>
									Reset Filters
								</Button>
							</div>
						</div>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{filteredListings.map((listing) => {
							const imageUrl = listing.imageUrls[0] ?? PRESALE_IMAGE_FALLBACK;

							return (
								<div
									key={listing.id}
									className="group relative"
								>
									<ListingCard
										id={listing.id}
										title={listing.title}
										price={listing.price}
										address={listing.address}
										beds={listing.bedrooms}
										baths={listing.bathrooms}
										sqft={listing.squareFeet}
										imageUrl={imageUrl}
										status={listing.status ?? undefined}
										type="sale"
										href={`/presale/${listing.id}`}
									/>
									<div className="bg-primary text-primary-foreground absolute -top-3 -right-3 z-20 rotate-3 transform rounded-full px-3 py-1 text-xs font-bold shadow-md">Est. {listing.completion}</div>
								</div>
							);
						})}
						{isLoading && <div className="text-muted-foreground col-span-full py-12 text-center">Loading presale properties...</div>}
						{!isLoading && filteredListings.length === 0 && <div className="text-muted-foreground col-span-full py-12 text-center">{loadError ?? "No presale properties found matching your criteria."}</div>}
					</div>
				</div>
			</div>
		</div>
	);
}
