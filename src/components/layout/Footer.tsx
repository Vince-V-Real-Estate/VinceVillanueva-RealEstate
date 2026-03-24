"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Separator} from "@/components/ui/separator";
import {newsletterSchema, type NewsletterFormData} from "@/lib/zod/newsletter-validation";
import {createLogger} from "@/lib/logger";
import {MLS_ATTRIBUTION} from "@/lib/constants/legal";
import {EMAIL_CONTACT, PHONE_NUMBER} from "@/lib/constants/contact";

const log = createLogger("newsletter");

export function Footer() {
	const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
	const {
		register,
		handleSubmit,
		reset,
		formState: {errors, isSubmitting},
	} = useForm<NewsletterFormData>({
		resolver: zodResolver(newsletterSchema),
	});

	const onSubmit = async (data: NewsletterFormData) => {
		setSubmitStatus("idle");
		const rawPrefix = data.email.split("@")[0]?.trim() ?? "";
		const fullName = rawPrefix.length >= 2 ? rawPrefix : "Newsletter Subscriber";

		try {
			const response = await fetch("/api/leads", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					fullName,
					email: data.email,
					source: "newsletter",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to subscribe");
			}

			log.info("Newsletter subscription successful", {email: data.email});
			setSubmitStatus("success");
			reset();
		} catch (error) {
			log.error("Newsletter subscription failed", error);
			setSubmitStatus("error");
		}
	};

	useEffect(() => {
		if (submitStatus !== "success") {
			return;
		}

		const timerId = setTimeout(() => {
			setSubmitStatus("idle");
		}, 3000);

		return () => clearTimeout(timerId);
	}, [submitStatus]);

	return (
		<footer className="bg-muted py-12 md:py-16 lg:py-24">
			<div className="container mx-auto px-4 md:px-6">
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<span className="text-xl font-bold">Vince Villanueva Real Estate</span>
						</div>
						<div className="text-muted-foreground flex flex-col space-y-1 text-sm">
							<p>
								Phone:{" "}
								<a
									href={`tel:${PHONE_NUMBER}`}
									className="hover:text-foreground"
								>
									{PHONE_NUMBER}
								</a>
							</p>
							<p>
								Email:{" "}
								<a
									href={`mailto:${EMAIL_CONTACT}`}
									className="hover:text-foreground"
								>
									{EMAIL_CONTACT}
								</a>
							</p>
						</div>
					</div>
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Quick Links</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/listings"
									className="text-muted-foreground hover:text-foreground"
								>
									View Listings
								</Link>
							</li>
							<li>
								<Link
									href="/buy"
									className="text-muted-foreground hover:text-foreground"
								>
									Buy
								</Link>
							</li>
							<li>
								<Link
									href="/sell"
									className="text-muted-foreground hover:text-foreground"
								>
									Sell your home
								</Link>
							</li>
							<li>
								<Link
									href="/mortgage-calculator"
									className="text-muted-foreground hover:text-foreground"
								>
									Calculate your Mortgage
								</Link>
							</li>
						</ul>
					</div>
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Info</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/about"
									className="text-muted-foreground hover:text-foreground"
								>
									About me
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-muted-foreground hover:text-foreground"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Newsletter</h3>
						<p className="text-muted-foreground text-sm">Get the latest market trends delivered to your inbox.</p>
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="flex flex-col space-y-2"
						>
							<div className="flex space-x-2">
								<input
									className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Enter your email"
									type="email"
									disabled={isSubmitting || submitStatus === "success"}
									{...register("email")}
								/>
								<button
									type="submit"
									disabled={isSubmitting || submitStatus === "success"}
									className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs focus-visible:ring-1 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
								>
									{isSubmitting ? "..." : "Join"}
								</button>
							</div>
							{errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
							{submitStatus === "success" && <p className="text-sm text-green-600">Thanks for subscribing!</p>}
							{submitStatus === "error" && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
						</form>
					</div>
				</div>
				<div className="text-muted-foreground mt-12 space-y-4 text-xs">
					<p>{MLS_ATTRIBUTION}</p>
					<p>Disclaimer: The user is responsible for verifying all information and sources.</p>
				</div>
				<Separator className="my-8" />
				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					<p className="text-muted-foreground text-center text-sm md:text-left">&copy; 2026 Vince Villanueva V3 Real Estate. All rights reserved.</p>
					<div className="text-muted-foreground flex gap-4 text-sm">
						<Link
							href="/privacy"
							className="hover:text-foreground"
						>
							Privacy Policy
						</Link>
						<Link
							href="/terms"
							className="hover:text-foreground"
						>
							Terms & Conditions
						</Link>
						<Link
							href="/cookies"
							className="hover:text-foreground"
						>
							Cookies
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
