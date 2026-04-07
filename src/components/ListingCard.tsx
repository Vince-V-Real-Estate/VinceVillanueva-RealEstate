import Image from "next/image";
import Link from "next/link";
import {Bed, Bath, Square, MapPin, ArrowRight} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";

export interface ListingCardProps {
	id: string;
	title: string;
	price: number;
	address: string;
	beds: number;
	baths: number;
	sqft: number;
	imageUrl: string;
	status?: "new" | "featured" | "sold";
	type?: "sale" | "rent";
}

export function ListingCard({id, title, price, address, beds, baths, sqft, imageUrl, status, type = "sale"}: ListingCardProps) {
	return (
		<Link
			href={`/listings/${id}`}
			className="group block h-full"
		>
			<Card className="border-border/50 bg-background hover:border-primary/30 flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
				<div className="relative aspect-[4/3] overflow-hidden">
					<Image
						src={imageUrl}
						alt={title}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

					{status && (
						<Badge
							className="absolute top-3 left-3 z-10 text-[10px] font-medium tracking-wider uppercase shadow-sm"
							variant={status === "sold" ? "secondary" : "default"}
						>
							{status}
						</Badge>
					)}
					<Badge
						className="bg-background/95 text-foreground hover:bg-background absolute top-3 right-3 z-10 font-medium shadow-sm backdrop-blur-md"
						variant="outline"
					>
						{type === "rent" ? "For Rent" : "For Sale"}
					</Badge>
				</div>

				<div className="flex flex-grow flex-col p-5">
					<div className="mb-4">
						<h3 className="group-hover:text-primary line-clamp-1 text-xl font-semibold tracking-tight transition-colors">{title}</h3>
						<div className="text-muted-foreground mt-1.5 flex items-center text-sm">
							<MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0" />
							<span className="line-clamp-1">{address}</span>
						</div>
					</div>

					<div className="divide-border/50 border-border/50 mt-auto mb-4 grid grid-cols-3 gap-2 divide-x border-y py-3">
						<div className="flex flex-col items-center justify-center gap-1">
							<Bed className="text-muted-foreground h-4 w-4" />
							<span className="text-sm font-medium">
								{beds} <span className="text-muted-foreground ml-0.5 text-[10px] tracking-wider uppercase">Beds</span>
							</span>
						</div>
						<div className="flex flex-col items-center justify-center gap-1">
							<Bath className="text-muted-foreground h-4 w-4" />
							<span className="text-sm font-medium">
								{baths} <span className="text-muted-foreground ml-0.5 text-[10px] tracking-wider uppercase">Baths</span>
							</span>
						</div>
						<div className="flex flex-col items-center justify-center gap-1">
							<Square className="text-muted-foreground h-4 w-4" />
							<span className="text-sm font-medium">
								{sqft.toLocaleString()} <span className="text-muted-foreground ml-0.5 text-[10px] tracking-wider uppercase">SqFt</span>
							</span>
						</div>
					</div>

					<div className="flex items-center justify-between pt-1">
						<div className="text-2xl font-bold tracking-tight">
							${price.toLocaleString()}
							{type === "rent" && <span className="text-muted-foreground text-sm font-normal">/mo</span>}
						</div>
						<div className="bg-primary/10 text-primary -translate-x-4 rounded-full p-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
							<ArrowRight className="h-4 w-4" />
						</div>
					</div>
				</div>
			</Card>
		</Link>
	);
}
