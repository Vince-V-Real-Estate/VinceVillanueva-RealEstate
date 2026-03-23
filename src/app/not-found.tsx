import Link from "next/link";
import {Home, Search, Mail} from "lucide-react";
import {buttonVariants} from "@/components/ui/button-variants";
import {cn} from "@/lib/utils";

export default function NotFound() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
			<div className="max-w-lg space-y-6">
				<div className="space-y-2">
					<h1 className="text-foreground/20 text-8xl font-bold tracking-tighter">404</h1>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h2>
					<p className="text-muted-foreground text-lg">Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed, renamed, or doesn&apos;t exist.</p>
				</div>

				<div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
					<Link
						href="/"
						className={cn(
							buttonVariants({
								variant: "default",
								size: "lg",
							}),
							"w-full sm:w-auto",
						)}
					>
						<Home className="h-4 w-4" />
						Back to Home
					</Link>
					<Link
						href="/listings"
						className={cn(
							buttonVariants({
								variant: "outline",
								size: "lg",
							}),
							"w-full sm:w-auto",
						)}
					>
						<Search className="h-4 w-4" />
						Search Listings
					</Link>
					<Link
						href="/contact"
						className={cn(
							buttonVariants({
								variant: "ghost",
								size: "lg",
							}),
							"w-full sm:w-auto",
						)}
					>
						<Mail className="h-4 w-4" />
						Contact Support
					</Link>
				</div>
			</div>
		</div>
	);
}
