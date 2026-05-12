"use client";

import Image from "next/image";
import {Loader2, Pencil, Trash2} from "lucide-react";

import {Button} from "@/components/ui/button";
import type {PresaleListing} from "@/lib/presales/types";
import {formatBathrooms, formatPrice} from "@/utils/format";

interface CurrentPreSaleHomesProps {
	listings: PresaleListing[];
	isLoading: boolean;
	isMutating: boolean;
	onEdit: (listing: PresaleListing) => void;
	onDelete: (listing: PresaleListing) => void;
}

/**
 * Displays a list of current presale listings with edit/delete actions.
 * Mobile-first card layout with responsive image and details.
 */
export function CurrentPreSaleHomes({listings, isLoading, isMutating, onEdit, onDelete}: CurrentPreSaleHomesProps) {
	return (
		<div className="space-y-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
			<div className="flex items-center">
				<h3 className="text-lg font-semibold text-gray-900">Current Pre-Sale Listings</h3>
			</div>

			{isLoading ? (
				<div className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-6 text-gray-500">
					<Loader2 className="h-4 w-4 animate-spin" />
					Loading pre-sale listings...
				</div>
			) : listings.length === 0 ? (
				<div className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center text-gray-500">No pre-sale listings yet.</div>
			) : (
				<div className="space-y-3">
					{listings.map((listing) => {
						const thumbnailUrl = listing.imageUrls[0];

						return (
							<div
								key={listing.id}
								className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="flex min-w-0 items-center gap-3">
									{/* Thumbnail */}
									<div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
										{thumbnailUrl ? (
											<Image
												src={thumbnailUrl}
												alt={listing.title}
												fill
												className="object-cover"
												sizes="80px"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No img</div>
										)}
									</div>

									{/* Details */}
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-gray-900">{listing.title}</p>
										<p className="truncate text-sm text-gray-500">{listing.address}</p>
										<p className="truncate text-xs text-gray-600">
											{formatPrice(listing.price)} &bull; {listing.bedrooms} bd &bull; {formatBathrooms(listing.bathrooms)} ba &bull; {listing.squareFeet.toLocaleString()} sqft
										</p>
										<p className="truncate text-xs text-gray-500">
											{listing.developer} &bull; {listing.completion}
											{listing.status ? ` \u2022 ${listing.status}` : ""}
										</p>
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(listing)}
										disabled={isMutating}
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => onDelete(listing)}
										disabled={isMutating}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
