"use client";

import {useState} from "react";
import {Search} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ListingCard} from "@/components/ListingCard";

const ALL_LISTINGS = [
	{
		id: "1",
		title: "The Glass Pavilion",
		price: 2450000,
		address: "Malibu, California",
		beds: 5,
		baths: 4,
		sqft: 4200,
		imageUrl: "https://images.unsplash.com/photo-1600596542815-22b5dbf1529e?q=80&w=2938&auto=format&fit=crop",
		status: "featured" as const,
		type: "sale" as const,
	},
	{
		id: "2",
		title: "Skyline Modern",
		price: 1850000,
		address: "Austin, Texas",
		beds: 4,
		baths: 3,
		sqft: 3100,
		imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop",
		status: "new" as const,
		type: "sale" as const,
	},
	{
		id: "3",
		title: "Palm Estates",
		price: 3200000,
		address: "Miami, Florida",
		beds: 6,
		baths: 5,
		sqft: 5800,
		imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2953&auto=format&fit=crop",
		status: "new" as const,
		type: "sale" as const,
	},
	{
		id: "4",
		title: "Cozy Cottage",
		price: 450000,
		address: "Portland, Oregon",
		beds: 3,
		baths: 2,
		sqft: 1500,
		imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop",
		type: "sale" as const,
	},
	{
		id: "5",
		title: "Urban Loft",
		price: 3500,
		address: "New York, NY",
		beds: 1,
		baths: 1,
		sqft: 800,
		imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2880&auto=format&fit=crop",
		type: "rent" as const,
	},
	{
		id: "6",
		title: "Suburban Family Home",
		price: 750000,
		address: "Chicago, Illinois",
		beds: 4,
		baths: 3,
		sqft: 2800,
		imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2940&auto=format&fit=crop",
		type: "sale" as const,
	},
];

export default function ListingsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [propertyType, setPropertyType] = useState("all");

	const filteredListings = ALL_LISTINGS.filter((listing) => {
		const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) || listing.address.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesType = propertyType === "all" || (propertyType === "rent" ? listing.type === "rent" : listing.type === "sale");

		return matchesSearch && matchesType;
	});

	return (
		<div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
			<div className="flex flex-col gap-8">
				<div className="space-y-4">
					<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Property Listings</h1>
					<p className="text-muted-foreground md:text-xl">Explore our curated selection of premium properties.</p>
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
											placeholder="Search location..."
											className="pl-9"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label>Property Status</Label>
									<Select
										value={propertyType}
										onValueChange={(val) => setPropertyType(val ?? "all")}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Properties</SelectItem>
											<SelectItem value="sale">For Sale</SelectItem>
											<SelectItem value="rent">For Rent</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{/* Add more filters here (Price, Beds, Baths) */}
								<Button
									className="w-full"
									onClick={() => {
										setSearchTerm("");
										setPropertyType("all");
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
								{...listing}
							/>
						))}
						{filteredListings.length === 0 && <div className="text-muted-foreground col-span-full py-12 text-center">No properties found matching your criteria.</div>}
					</div>
				</div>
			</div>
		</div>
	);
}
