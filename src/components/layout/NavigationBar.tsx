"use client";

import * as React from "react";
import Link from "next/link";
import {Menu, LayoutDashboard} from "lucide-react";

import {buttonVariants} from "@/components/ui/button";
import {NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyleTransparent} from "@/components/ui/navigation-menu";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {cn} from "@/lib/utils";
import {AccountControls} from "@/components/layout/AccountControls";
import {authClient} from "@/server/better-auth/client";
import Image from "next/image";

export function NavigationBar() {
	const [isOpen, setIsOpen] = React.useState(false);
	const {data: session} = authClient.useSession();
	const isAdmin = session?.user?.role === "admin";

	return (
		<header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md">
			<div className="container mx-auto flex h-16 items-center px-4 md:px-6">
				<div className="mr-4 hidden md:flex">
					<Link
						href="/"
						className="mr-6 flex items-center space-x-2"
					>
						<Image
							src={"/vv-logo.svg"}
							alt="Vince Villanueva Realtor"
							width={150}
							height={34}
						/>
					</Link>
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem className="bg-transparent">
								<Link
									href="/listings"
									className={navigationMenuTriggerStyleTransparent()}
								>
									Listings
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link
									href="/buy"
									className={navigationMenuTriggerStyleTransparent()}
								>
									Buy
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link
									href="/sell"
									className={navigationMenuTriggerStyleTransparent()}
								>
									Sell
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link
									href="/#about"
									className={navigationMenuTriggerStyleTransparent()}
								>
									About
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link
									href="/#contact"
									className={navigationMenuTriggerStyleTransparent()}
								>
									Contact
								</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
				<Sheet
					open={isOpen}
					onOpenChange={setIsOpen}
				>
					<SheetTrigger className={cn(buttonVariants({variant: "ghost", size: "icon"}), "mr-2 md:hidden")}>
						<Menu className="h-6 w-6" />
						<span className="sr-only">Toggle Menu</span>
					</SheetTrigger>

					<Image
						src={"/vv-logo.svg"}
						width={150}
						height={34}
						alt="Vince Villanueva Realtor"
						className="block md:hidden"
					/>
					<SheetContent
						side="left"
						className="pr-0"
					>
						<Link
							href="/"
							className="flex items-center"
							onClick={() => setIsOpen(false)}
						>
							<Image
								src={"/vv-logo.svg"}
								alt="Vince Villanueva Realtor"
								width={150}
								height={34}
							/>
						</Link>
						<div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
							<div className="flex flex-col space-y-3">
								<Link
									href="/listings"
									onClick={() => setIsOpen(false)}
									className="py-2 text-lg font-medium"
								>
									Listings
								</Link>
								<Link
									href="/buy"
									onClick={() => setIsOpen(false)}
									className="py-2 text-lg font-medium"
								>
									Buy
								</Link>
								<Link
									href="/sell"
									onClick={() => setIsOpen(false)}
									className="py-2 text-lg font-medium"
								>
									Sell
								</Link>
								<Link
									href="/#about"
									onClick={() => setIsOpen(false)}
									className="py-2 text-lg font-medium"
								>
									About
								</Link>
								<Link
									href="/#contact"
									onClick={() => setIsOpen(false)}
									className="py-2 text-lg font-medium"
								>
									Contact
								</Link>
								{isAdmin && (
									<Link
										href="/dashboard"
										onClick={() => setIsOpen(false)}
										className="flex items-center gap-2 py-2 text-lg font-medium text-blue-600"
									>
										<LayoutDashboard className="h-5 w-5" />
										Dashboard
									</Link>
								)}
								<AccountControls
									variant="mobile"
									onNavigate={() => setIsOpen(false)}
								/>
							</div>
						</div>
					</SheetContent>
				</Sheet>
				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
					<div className="w-full flex-1 md:w-auto md:flex-none">{/* Search could go here if needed in header */}</div>
					<nav className="flex items-center space-x-2">
						{isAdmin && (
							<Link
								href="/dashboard"
								className={cn(buttonVariants({variant: "ghost", size: "sm"}), "hidden gap-2 md:flex")}
							>
								<LayoutDashboard className="h-4 w-4" />
								Dashboard
							</Link>
						)}
						<AccountControls variant="desktop" />
					</nav>
				</div>
			</div>
		</header>
	);
}
