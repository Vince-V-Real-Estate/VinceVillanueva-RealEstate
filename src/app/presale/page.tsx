"use client";

import {useMemo, useState} from "react";
import {Search, Building2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ListingCard} from "@/components/ListingCard";

import {PRESALE_LISTINGS} from "@/lib/mock-data/presale";

const COMPLETION_YEAR_REGEX = /\b\d{4}\b/;

export default function PresalePage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [completionFilter, setCompletionFilter] = useState("all");

	const completionYears = useMemo(() => {
		const years = new Set(PRESALE_LISTINGS.map(({completion}) => COMPLETION_YEAR_REGEX.exec(completion)?.[0]).filter((year): year is string => Boolean(year)));

		return Array.from(years).sort((a, b) => Number(a) - Number(b));
	}, []);

	const filteredListings = useMemo(() => {
		const normalizedSearchTerm = searchTerm.toLowerCase();

		return PRESALE_LISTINGS.filter((listing) => {
			const matchesSearch = listing.title.toLowerCase().includes(normalizedSearchTerm) || listing.address.toLowerCase().includes(normalizedSearchTerm);

			const matchesCompletion = completionFilter === "all" || listing.completion.includes(completionFilter);

			return matchesSearch && matchesCompletion;
		});
	}, [searchTerm, completionFilter]);

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
						{filteredListings.map((listing) => (
							<div
								key={listing.id}
								className="group relative"
							>
								<ListingCard
									id={listing.id}
									title={listing.title}
									price={listing.price}
									address={listing.address}
									beds={listing.beds}
									baths={listing.baths}
									sqft={listing.sqft}
									imageUrl={listing.imageUrl}
									status={listing.status}
									type={listing.type}
									href={`/presale/${listing.id}`}
								/>
								<div className="bg-primary text-primary-foreground absolute -top-3 -right-3 z-20 rotate-3 transform rounded-full px-3 py-1 text-xs font-bold shadow-md">Est. {listing.completion}</div>
							</div>
						))}
						{filteredListings.length === 0 && <div className="text-muted-foreground col-span-full py-12 text-center">No presale properties found matching your criteria.</div>}
					</div>
				</div>
			</div>
		</div>
	);
}
