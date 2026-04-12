"use client";

import {useMemo, useState} from "react";
import {Search, Building2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ListingCard} from "@/components/ListingCard";

// Mock data for presale homes
const PRESALE_LISTINGS = [
	{
		id: "ps-1",
		title: "Oasis Tower",
		price: 850000,
		address: "Downtown Vancouver, BC",
		beds: 2,
		baths: 2,
		sqft: 950,
		imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2940&auto=format&fit=crop",
		status: "new" as const,
		type: "sale" as const,
		completion: "Fall 2026",
	},
	{
		id: "ps-2",
		title: "Lumina Residences",
		price: 1250000,
		address: "Burnaby Heights, BC",
		beds: 3,
		baths: 2,
		sqft: 1200,
		imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2953&auto=format&fit=crop",
		status: "featured" as const,
		type: "sale" as const,
		completion: "Spring 2025",
	},
	{
		id: "ps-3",
		title: "Apex Lofts",
		price: 620000,
		address: "Surrey Central, BC",
		beds: 1,
		baths: 1,
		sqft: 650,
		imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop",
		type: "sale" as const,
		completion: "Winter 2025",
	},
	{
		id: "ps-4",
		title: "The Horizon",
		price: 2100000,
		address: "West Vancouver, BC",
		beds: 4,
		baths: 3,
		sqft: 2200,
		imageUrl: "https://images.unsplash.com/photo-1600596542815-22b5dbf1529e?q=80&w=2938&auto=format&fit=crop",
		status: "new" as const,
		type: "sale" as const,
		completion: "Summer 2027",
	},
];

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
							<ListingCard
								key={listing.id}
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
								completion={listing.completion}
							/>
						))}
						{filteredListings.length === 0 && <div className="text-muted-foreground col-span-full py-12 text-center">No presale properties found matching your criteria.</div>}
					</div>
				</div>
			</div>
		</div>
	);
}
