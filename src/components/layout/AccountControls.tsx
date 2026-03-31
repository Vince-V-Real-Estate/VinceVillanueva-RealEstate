"use client";

import Link from "next/link";
import {CircleUserRound} from "lucide-react";

import {buttonVariants} from "@/components/ui/button";
import {authClient} from "@/server/better-auth/client";
import {cn} from "@/lib/utils";

interface AccountControlsProps {
	variant: "desktop" | "mobile";
	onNavigate?: () => void;
}

export function AccountControls({variant, onNavigate}: AccountControlsProps) {
	return (
		<AccountSessionControls
			variant={variant}
			onNavigate={onNavigate}
		/>
	);
}

function AccountSessionControls({variant, onNavigate}: AccountControlsProps) {
	const {data: session, isPending} = authClient.useSession();

	if (isPending) {
		return variant === "mobile" ? null : (
			<span
				className={buttonVariants({size: "sm"})}
				aria-hidden="true"
			>
				Sign In
			</span>
		);
	}

	const isAuthed = !!session?.user;

	if (isAuthed) {
		if (variant === "mobile") {
			return (
				<Link
					href="/account"
					onClick={onNavigate}
					className="py-2 text-lg font-medium"
				>
					My Account
				</Link>
			);
		}

		return (
			<Link
				href="/account"
				className="rounded-full bg-black p-2 hover:bg-white"
			>
				<CircleUserRound color="#FFFFFF" />
			</Link>
		);
	}

	if (variant === "mobile") {
		return (
			<div className="flex w-full justify-start pt-4 pr-6">
				<Link
					href="/auth/sign-in"
					onClick={onNavigate}
					className={cn(buttonVariants({variant: "default"}), "w-[80%] max-w-60")}
				>
					Sign In
				</Link>
			</div>
		);
	}

	return (
		<Link
			href="/auth/sign-in"
			className={buttonVariants({size: "sm"})}
		>
			Sign In
		</Link>
	);
}
