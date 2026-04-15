import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {Bath, Bed, MapPin, Square, Calendar, Building, CheckCircle2, ChevronLeft} from "lucide-react";

import {buttonVariants} from "@/components/ui/button-variants";
import {Badge} from "@/components/ui/badge";
import {formatBathroomCount, formatFeaturedListingPrice} from "@/lib/featured-listings/types";
import {PRESALE_LISTINGS} from "@/lib/mock-data/presale";

interface PresaleDetailPageProps {
	params: Promise<{presaleId: string}>;
}

export default async function PresaleDetailPage({params}: PresaleDetailPageProps) {
	const {presaleId} = await params;

	// Simulated DB fetch using the mock data
	const listing = PRESALE_LISTINGS.find((p) => p.id === presaleId);

	if (!listing) {
		notFound();
	}

	const images = listing.images && listing.images.length > 0 ? listing.images : [listing.imageUrl];

	return (
		<div className="bg-zinc-50 pb-20">
			{/* Hero Image Section */}
			<div className="relative h-[50vh] min-h-100 w-full lg:h-[70vh]">
				<Image
					src={images[0] ?? listing.imageUrl}
					alt={listing.title}
					fill
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

				<div className="absolute top-6 left-6 z-10 md:top-10 md:left-10">
					<Link
						href="/presale"
						className={buttonVariants({variant: "outline", size: "sm", className: "border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"})}
					>
						<ChevronLeft className="mr-1 h-4 w-4" /> Back to Presales
					</Link>
				</div>

				<div className="absolute right-6 bottom-6 left-6 text-white md:right-10 md:bottom-10 md:left-10">
					<div className="mb-4 flex flex-wrap items-center gap-3">
						{listing.status && <Badge className="bg-primary/90 text-primary-foreground text-xs tracking-wider uppercase">{listing.status === "new" ? "New Presale" : listing.status}</Badge>}
						<Badge
							variant="outline"
							className="border-white/50 bg-black/20 text-white backdrop-blur-md"
						>
							Est. Completion: {listing.completion}
						</Badge>
					</div>
					<h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{listing.title}</h1>
					<div className="mt-4 flex flex-col gap-4 text-white/90 sm:flex-row sm:items-center">
						<div className="flex items-center text-lg">
							<MapPin className="text-primary mr-2 h-5 w-5" />
							{listing.address}
						</div>
						<div className="hidden text-white/40 sm:block">•</div>
						<p className="text-3xl font-semibold text-white">{formatFeaturedListingPrice(listing.price)}</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 pt-10 md:px-6">
				<div className="grid gap-10 lg:grid-cols-3">
					{/* Left Column: Details & Gallery */}
					<div className="space-y-12 lg:col-span-2">
						{/* Key Specs */}
						<section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1">
								<Bed className="text-primary/70 mb-3 h-8 w-8" />
								<p className="text-2xl font-bold text-gray-900">{listing.beds}</p>
								<p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Bedrooms</p>
							</div>
							<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1">
								<Bath className="text-primary/70 mb-3 h-8 w-8" />
								<p className="text-2xl font-bold text-gray-900">{formatBathroomCount(listing.baths)}</p>
								<p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Bathrooms</p>
							</div>
							<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1">
								<Square className="text-primary/70 mb-3 h-8 w-8" />
								<p className="text-2xl font-bold text-gray-900">{listing.sqft.toLocaleString()}</p>
								<p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Square Feet</p>
							</div>
							<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1">
								<Building className="text-primary/70 mb-3 h-8 w-8" />
								<p className="line-clamp-2 text-center text-lg leading-tight font-bold text-gray-900">{listing.developer}</p>
								<p className="mt-1 text-xs font-medium tracking-wider text-gray-500 uppercase">Developer</p>
							</div>
						</section>

						{/* Description */}
						<section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
							<h2 className="mb-6 text-2xl font-bold text-gray-900">About {listing.title}</h2>
							<p className="text-lg leading-relaxed text-gray-600">{listing.description}</p>
						</section>

						{/* Amenities */}
						{listing.amenities && listing.amenities.length > 0 && (
							<section>
								<h2 className="mb-6 text-2xl font-bold text-gray-900">Exclusive Amenities</h2>
								<div className="grid gap-4 sm:grid-cols-2">
									{listing.amenities.map((amenity, idx) => (
										<div
											key={idx}
											className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
										>
											<CheckCircle2 className="text-primary h-6 w-6" />
											<span className="font-medium text-gray-800">{amenity}</span>
										</div>
									))}
								</div>
							</section>
						)}

						{/* Image Gallery Mosaic */}
						{images.length > 1 && (
							<section>
								<h2 className="mb-6 text-2xl font-bold text-gray-900">Gallery</h2>
								<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
									{images.slice(1, 4).map((img, idx) => (
										<div
											key={idx}
											className={`relative aspect-square overflow-hidden rounded-2xl ${idx === 2 ? "col-span-2 md:col-span-1" : ""}`}
										>
											<Image
												src={img}
												alt={`${listing.title} gallery image ${idx + 1}`}
												fill
												className="object-cover transition-transform duration-500 hover:scale-110"
											/>
										</div>
									))}
								</div>
							</section>
						)}
					</div>

					{/* Right Column: CTA / Sticky Sidebar */}
					<div className="lg:col-span-1">
						<div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
							<h3 className="text-xl font-bold text-gray-900">Interested in {listing.title}?</h3>
							<p className="mt-3 text-gray-600">Register early to secure VIP access, floor plans, and exclusive pricing before the public launch.</p>

							<div className="mt-8 space-y-6">
								<div className="flex items-center gap-4 rounded-xl bg-zinc-50 p-4">
									<Calendar className="text-primary h-8 w-8" />
									<div>
										<p className="text-sm font-medium text-gray-500">Estimated Completion</p>
										<p className="font-bold text-gray-900">{listing.completion}</p>
									</div>
								</div>

								<div className="flex flex-col gap-3">
									<Link
										href="/contact"
										className={buttonVariants({
											variant: "default",
											size: "lg",
											className: "w-full text-base font-semibold shadow-md",
										})}
									>
										Request VIP Access
									</Link>
									<Link
										href="/presale"
										className={buttonVariants({
											variant: "outline",
											size: "lg",
											className: "w-full",
										})}
									>
										View Other Presales
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
