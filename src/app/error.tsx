"use client";

import {useEffect} from "react";
import Link from "next/link";
import {RotateCcw, Mail, AlertTriangle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {buttonVariants} from "@/components/ui/button-variants";
import {createLogger} from "@/lib/logger";
import {cn} from "@/lib/utils";

const log = createLogger("error-page");

export default function Error({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "auto",
		});
		log.error("Unhandled client error", error);
	}, [error]);

	return (
		<div className="m-auto flex min-h-[70vh] flex-col items-center justify-center px-4 pt-14 text-center">
			<div className="max-w-lg space-y-6">
				<div className="bg-destructive/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
					<AlertTriangle className="text-destructive h-10 w-10" />
				</div>
				<div className="space-y-2">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Something went wrong!</h2>
					<p className="text-muted-foreground text-lg">We&apos;re experiencing an internal server problem. Please try again or contact support if the issue persists.</p>
				</div>

				<div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
					<Button
						onClick={reset}
						size="lg"
						className="w-full sm:w-auto"
					>
						<RotateCcw className="h-4 w-4" />
						Try again
					</Button>
					<Link
						href="/contact"
						className={cn(
							buttonVariants({
								variant: "outline",
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
