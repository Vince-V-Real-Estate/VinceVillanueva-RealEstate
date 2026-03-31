"use client";

import {LeadCaptureForm} from "@/components/forms/lead-capture";
import {PHONE_NUMBER} from "@/lib/constants/contact";
import {PhoneCall} from "lucide-react";

export function CallCTA() {
	return (
		<section className="relative w-full overflow-hidden bg-black py-24 text-white md:py-32">
			<div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-20" />

			<div className="relative z-10 container mx-auto px-4 md:px-6">
				<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
					<div className="space-y-8">
						<h2 className="font-serif text-4xl leading-[1.1] md:text-5xl lg:text-6xl">
							<span className="mb-4 block font-sans text-lg tracking-wide text-gray-400 uppercase">Let&apos;s Connect</span>
							Ready to make <br />
							<span className="text-white italic">your next move?</span>
						</h2>

						<p className="max-w-lg text-xl leading-relaxed text-gray-400">Whether you&apos;re buying, selling, or just exploring the market, a conversation is the best place to start.</p>

						<div className="flex items-center gap-6 pt-4">
							<a
								href="tel:6045550123"
								className="group flex items-center gap-4 rounded-full border border-white/10 bg-white/10 px-8 py-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
							>
								<div className="rounded-full bg-white p-2 text-black transition-transform group-hover:scale-110">
									<PhoneCall size={20} />
								</div>
								<span className="text-lg font-medium tracking-wide">{PHONE_NUMBER} </span>
							</a>
						</div>
					</div>

					<div className="relative">
						<div className="absolute -inset-1 rounded-[2rem] bg-linear-to-tr from-purple-500/20 via-blue-500/20 to-pink-500/20 opacity-50 blur-xl" />
						<div className="relative rounded-[2rem] border border-white/10 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl md:p-10">
							<div className="mb-8">
								<h3 className="mb-2 text-2xl font-light text-white">Schedule Consultation</h3>
								<div className="h-1 w-12 rounded-full bg-white/20" />
							</div>
							{/* Override form styles for dark mode context */}
							<div className="[&_button]:bg-white [&_button]:text-black [&_button:hover]:bg-gray-200 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder-white/30 [&_input:focus]:border-white [&_label]:text-white/60 [&_textarea]:border-white/20 [&_textarea]:text-white [&_textarea:focus]:border-white">
								<LeadCaptureForm type="call" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
