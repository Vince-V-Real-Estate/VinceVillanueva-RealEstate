import Link from "next/link";
import {Calculator} from "lucide-react";

import {buttonVariants} from "@/components/ui/button-variants";
import {cn} from "@/lib/utils";
import {LeadCaptureForm} from "../forms/lead-capture";

export function MortgageCTA() {
	return (
		<section className="bg-primary/10 py-12 md:py-24 lg:py-32">
			<div className="container mx-auto px-4 md:px-6">
				<div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
					<div className="flex flex-col justify-center space-y-4">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Plan your budget with our Mortgage Calculator</h2>
							<p className="text-muted-foreground max-w-150 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
								Estimate your monthly payments and see how much home you can afford. Our tools make financing transparent and easy.
							</p>
						</div>
						<div className="flex flex-col gap-2 min-[400px]:flex-row">
							<Link
								href="/mortgage-calculator"
								className={cn(buttonVariants({size: "lg"}), "inline-flex")}
							>
								<Calculator className="mr-2 h-4 w-4" />
								Calculate Now
							</Link>
						</div>
					</div>

					<div className="bg-background mx-auto mt-8 flex w-full max-w-lg flex-col justify-center rounded-2xl border p-6 shadow-md sm:p-8 lg:mt-0 lg:max-w-none">
						<div className="mb-6 space-y-2 text-center lg:text-left">
							<h3 className="text-2xl font-extrabold tracking-tight">
								Sign up for<span className="text-primary italic">newsletters</span>
							</h3>
							<p className="text-muted-foreground">Get the most recent market trends and insights delivered directly to your inbox.</p>
						</div>
						<LeadCaptureForm type="newsletter" />
					</div>
				</div>
			</div>
		</section>
	);
}
