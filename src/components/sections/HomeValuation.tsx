"use client";

import Link from "next/link";
import {NotebookPen, ArrowRight} from "lucide-react";

export function HomeValuation() {
	return (
		<section className="relative w-full overflow-hidden bg-white py-16 md:py-24 lg:py-32">
			<div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-size-[16px_16px] opacity-20" />

			<div className="relative container mx-auto px-4 md:px-6">
				<div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
					<div className="flex flex-col justify-center space-y-6">
						<div className="space-y-4">
							<span className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Trying to sell your home?</span>
							<h2 className="text-4xl font-light tracking-tight text-gray-900 sm:text-6xl">
								What is your <br />
								<span className="font-serif text-black italic">home worth?</span>
							</h2>
							<p className="max-w-150 text-lg leading-relaxed text-gray-600">Receive a comprehensive valuation report tailored to your property&apos;s unique features and current market conditions.</p>
						</div>

						<div className="space-y-4 pt-4">
							{["Instant Preliminary Estimate", "Comparative Market Analysis", "Expert Strategic Advice"].map((item, i) => (
								<div
									key={i}
									className="group flex items-center gap-4"
								>
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:scale-110">
										<span className="text-xs font-bold">{i + 1}</span>
									</div>
									<span className="text-base font-medium text-gray-800">{item}</span>
								</div>
							))}
						</div>
					</div>

					<div className="flex w-full items-center justify-end justify-self-end">
						<div className="relative mx-auto w-full max-w-md">
							<Link
								href="/sell"
								className="group flex w-full items-center justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-black hover:shadow-lg hover:shadow-black/5"
							>
								<div className="flex items-center gap-5">
									<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-50 transition-colors duration-300 group-hover:bg-black group-hover:text-white">
										<NotebookPen className="h-6 w-6" />
									</div>
									<div className="flex flex-col">
										<span className="text-xl font-semibold text-gray-900">Get Your Free Evaluation</span>
										<span className="mt-1 text-sm text-gray-500 transition-colors group-hover:text-gray-700">Find out what your home is worth today</span>
									</div>
								</div>
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-400 transition-all duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white">
									<ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
								</div>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
