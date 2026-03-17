import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {Bath, Bed, MapPin, Square} from "lucide-react";

import {buttonVariants} from "@/components/ui/button";
import {formatBathroomCount, formatFeaturedListingPrice} from "@/lib/featured-listings/types";
import {getFeaturedListingById} from "@/server/featured-listings/service";

interface FeaturedListingPageProps {
	params: Promise<{featuredId: string}>;
}

export default async function FeaturedListingPage({params}: FeaturedListingPageProps) {
	const {featuredId} = await params;
	const listing = await getFeaturedListingById(featuredId);

	if (!listing) {
		notFound();
	}

	return (
		<div className="bg-zinc-50 py-10">
			<div className="container mx-auto px-4 md:px-6">
				<div className="mb-6">
					<Link
						href="/"
						className={buttonVariants({variant: "ghost", size: "sm"})}
					>
						Back to Homepage
					</Link>
				</div>

				<article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
					<div className="relative h-[36vh] min-h-[260px] w-full md:h-[48vh]">
						<Image
							src={listing.imageUrl}
							alt={listing.title}
							fill
							className="object-cover"
							priority
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

						<div className="absolute right-6 bottom-6 left-6 text-white">
							<p className="text-sm font-medium tracking-wider text-white/80 uppercase">Featured Listing</p>
							<h1 className="mt-1 text-3xl font-bold md:text-4xl">{listing.title}</h1>
							<p className="mt-2 text-2xl font-semibold md:text-3xl">{formatFeaturedListingPrice(listing.price)}</p>
						</div>
					</div>

					<div className="grid gap-8 p-6 md:grid-cols-3 md:p-8">
						<div className="md:col-span-2">
							<div className="mb-6 flex items-start gap-2 text-gray-700">
								<MapPin className="mt-0.5 h-4 w-4 shrink-0" />
								<span>{listing.address}</span>
							</div>

							<div className="grid gap-3 sm:grid-cols-3">
								<div className="rounded-lg border border-gray-200 p-4">
									<div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
										<Bed className="h-4 w-4" /> Bedrooms
									</div>
									<p className="text-lg font-semibold text-gray-900">{listing.bedrooms}</p>
								</div>

								<div className="rounded-lg border border-gray-200 p-4">
									<div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
										<Bath className="h-4 w-4" /> Bathrooms
									</div>
									<p className="text-lg font-semibold text-gray-900">{formatBathroomCount(listing.bathrooms)}</p>
								</div>

								<div className="rounded-lg border border-gray-200 p-4">
									<div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
										<Square className="h-4 w-4" /> Sq Ft
									</div>
									<p className="text-lg font-semibold text-gray-900">{listing.squareFeet.toLocaleString()}</p>
								</div>
							</div>
						</div>

						<aside className="rounded-xl border border-gray-200 bg-gray-50 p-5">
							<h2 className="text-lg font-semibold text-gray-900">Interested in this home?</h2>
							<p className="mt-2 text-sm leading-relaxed text-gray-600">Contact Vince for showing availability, disclosures, and listing details.</p>

							<div className="mt-5 space-y-2">
								<Link
									href="/contact"
									className={buttonVariants({
										variant: "default",
										className: "w-full",
									})}
								>
									Contact Agent
								</Link>
								<Link
									href="/listings"
									className={buttonVariants({
										variant: "outline",
										className: "w-full",
									})}
								>
									View More Listings
								</Link>
							</div>
						</aside>
					</div>
				</article>
			</div>
		</div>
	);
}
