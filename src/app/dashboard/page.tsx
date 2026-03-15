"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { LeadsManager } from "@/components/dashboard/LeadsManager";
import { FeaturedListingsManager } from "@/components/dashboard/FeaturedListingsManager";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

/**
 * Main admin dashboard page with tabbed navigation between Leads and Featured Listings.
 * Handles authentication and authorization, redirecting non-admin users.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<"leads" | "listings">("leads");

  useEffect(() => {
    // Wait for session to load
    if (sessionLoading) return;

    // Redirect if not authenticated or not admin
    if (!session?.user) {
      router.push("/auth/sign-in");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, sessionLoading, router]);

  // Loading state
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authorized (will redirect in useEffect, but safe return here)
  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your leads and website content
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user.name ?? session.user.email}
              </span>
              <button
                onClick={() => router.push("/account")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Account
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <button
                    onClick={() => setActiveTab("leads")}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "cursor-pointer bg-transparent shadow-none hover:bg-gray-100 data-[state=open]:bg-transparent",
                      activeTab === "leads" && "bg-gray-100 font-semibold",
                    )}
                  >
                    Leads Management
                  </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    onClick={() => setActiveTab("listings")}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "cursor-pointer bg-transparent shadow-none hover:bg-gray-100 data-[state=open]:bg-transparent",
                      activeTab === "listings" && "bg-gray-100 font-semibold",
                    )}
                  >
                    Featured Listings
                  </button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "leads" ? <LeadsManager /> : <FeaturedListingsManager />}
      </main>
    </div>
  );
}
