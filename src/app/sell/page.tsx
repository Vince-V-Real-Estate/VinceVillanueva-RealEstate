import {LeadCaptureForm} from "@/components/forms/lead-capture";
import {SellerResources} from "@/components/sections/SellerResources";
import HashReset from "@/utils/HashReset";
import {BookOpen, CheckCircle2} from "lucide-react";

const guideHighlights = ["Step-by-step preparation checklist", "Pricing strategies that maximize ROI", "Marketing & negotiation playbook"];

export default function SellPage() {
	return (
		<>
			<HashReset />

			<main className="container mx-auto px-4 py-12 md:py-24">
				<h1 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">Selling your home?</h1>
				{/* Sellers Guide Request */}
				<section
					id="sellers-guide"
					className="my-16 md:my-24"
				>
					<div className="mx-auto grid max-w-6xl gap-10 overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-8 shadow-sm md:grid-cols-2 md:gap-16 md:p-12 lg:p-16">
						<div className="flex flex-col justify-center space-y-6">
							<div className="inline-flex w-fit items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium tracking-wide text-zinc-700 uppercase">
								<BookOpen className="h-3.5 w-3.5" />
								Free Resource
							</div>
							<h2 className="text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">
								The complete <span className="font-serif italic">Sellers Guide</span>
							</h2>
							<p className="text-lg leading-relaxed text-gray-600">Get the same playbook I share with my private clients. Delivered straight to your inbox — no obligations, ever.</p>
							<ul className="space-y-3">
								{guideHighlights.map((item) => (
									<li
										key={item}
										className="flex items-start gap-3 text-base text-gray-700"
									>
										<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
						<div className="bg-card text-card-foreground rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
							<div className="mb-4">
								<h3 className="text-2xl font-semibold tracking-tight">Request the guide</h3>
							</div>
							<LeadCaptureForm type="sellers-guide-request" />
						</div>
					</div>
				</section>

				<div className="flex w-full flex-col justify-center">
					<SellerResources />
				</div>

				<div className="flex w-full flex-col">
					<div className="my-2 md:my-5">
						<h2
							id="valuation-form"
							className="mb-2 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
						>
							Home Evaluation
						</h2>
						<p className="mx-auto max-w-md text-center text-gray-500">Receive a detailed market analysis with accurate home valuations based on current market trends, comparable sales, and your property&apos;s unique features.</p>
					</div>
					<div className="bg-card text-card-foreground mx-auto w-full max-w-lg rounded-xl border p-6 shadow-sm sm:p-8">
						<LeadCaptureForm type="valuation" />
					</div>
				</div>
			</main>
		</>
	);
}
