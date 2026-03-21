import {LeadCaptureForm} from "@/components/forms/lead-capture";
import {SellerResources} from "@/components/sections/SellerResources";

export default function SellPage() {
	return (
		<>
			<main className="container mx-auto px-4 py-12 md:py-24">
				<div className="mb-12 text-center">
					<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">Selling your home?</h1>
					<p className="text-muted-foreground mt-4 md:text-xl">Find out what your home is worth. Enter your details below for a free evaluation.</p>
				</div>
				<div className="flex w-full flex-col-reverse justify-center">
					<SellerResources />
					<div className="bg-card text-card-foreground mx-auto w-full max-w-lg rounded-xl border p-6 shadow-sm sm:p-8">
						<LeadCaptureForm type="valuation" />
					</div>
				</div>
			</main>
		</>
	);
}
