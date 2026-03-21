import {Home, TrendingUp, Sparkles} from "lucide-react";

const resources = [
	{
		title: "Prepare Your Home for Sale",
		description: "First impressions matter. Learn the essential repairs and updates that yield the highest return on investment before listing.",
		icon: Home,
	},
	{
		title: "Pricing Strategy Tips",
		description: "Discover how to competitively price your property to attract serious buyers while maximizing your final sale price.",
		icon: TrendingUp,
	},
	{
		title: "Professional Staging Advice",
		description: "Unlock the secrets of staging to help potential buyers visualize themselves living in your space, leading to faster offers.",
		icon: Sparkles,
	},
];

export function SellerResources() {
	return (
		<section className="w-full bg-white py-16 md:py-24">
			<div className="container mx-auto px-4 md:px-6">
				<div className="mb-16 max-w-3xl">
					<h2 className="text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">
						Resources for <span className="font-serif italic">Sellers</span>
					</h2>
					<p className="mt-6 text-lg text-gray-600 md:text-xl">Expert advice and proven strategies to help you sell your home faster and for top dollar.</p>
				</div>
				<div className="grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
					{resources.map((resource, index) => (
						<div
							key={index}
							className="group flex flex-col items-start"
						>
							<div className="mb-6 rounded-2xl bg-gray-50 p-4 transition-colors group-hover:bg-gray-100">
								<resource.icon
									className="h-8 w-8 text-gray-700"
									strokeWidth={1.5}
								/>
							</div>
							<h3 className="mb-4 text-xl font-semibold text-gray-900">{resource.title}</h3>
							<p className="text-base leading-relaxed text-gray-600">{resource.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
