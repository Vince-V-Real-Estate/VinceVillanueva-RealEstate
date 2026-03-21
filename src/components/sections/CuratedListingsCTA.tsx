"use client";

import {LeadCaptureForm} from "@/components/forms/lead-capture";

export function CuratedListingCTA() {
	return (
		<section className="w-full overflow-hidden bg-zinc-50 py-24 md:py-32">
			<div className="container mx-auto px-4 md:px-6">
				<div className="flex flex-col items-center gap-12 sm:gap-16 lg:flex-row lg:gap-0">
					<div className="w-full space-y-8 lg:w-1/2 xl:mr-40">
						<div className="space-y-4">
							<h2 className="text-4xl font-light tracking-tight text-gray-900 sm:text-5xl">
								Curated Listings <br />
								<span className="font-serif text-black italic">Direct to Inbox</span>
							</h2>
							<p className="max-w-md text-lg leading-relaxed text-gray-500">Don&apos;t miss out on new opportunities. Get customized alerts for properties that match your specific criteria before they hit the general market.</p>
						</div>
					</div>
					<div className="w-full max-w-lg lg:w-1/2">
						<LeadCaptureForm type="listings" />
					</div>
				</div>
			</div>
		</section>
	);
}
