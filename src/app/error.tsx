"use client";

import {useEffect} from "react";
import Link from "next/link";
import {RotateCcw, Mail, AlertTriangle} from "lucide-react";
import {createLogger} from "@/lib/logger";

const log = createLogger("error-page");

export default function Error({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
	useEffect(() => {
		// Log the error to an error reporting service
		log.error("Unhandled client error", error);
	}, [error]);

	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
			<div className="max-w-lg space-y-6">
				<div className="bg-destructive/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
					<AlertTriangle className="text-destructive h-10 w-10" />
				</div>
				<div className="space-y-2">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Something went wrong!</h2>
					<p className="text-muted-foreground text-lg">We&apos;re experiencing an internal server problem. Please try again or contact support if the issue persists.</p>
				</div>

				<div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
					<button
						onClick={() => reset()}
						className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
					>
						<RotateCcw className="h-4 w-4" />
						Try again
					</button>
					<Link
						href="/contact"
						className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
					>
						<Mail className="h-4 w-4" />
						Contact Support
					</Link>
				</div>
			</div>
		</div>
	);
}
