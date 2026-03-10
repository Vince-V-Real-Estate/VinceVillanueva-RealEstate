"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import type { LeadSource } from "@/utils/leads/types";

interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string | null;
  address: string | null;
  source: LeadSource;
  createdAt: string;
}

interface LeadsData {
  leads: Lead[];
  totalCount: number;
  bySource: Record<LeadSource, Lead[]>;
  dbUsage: {
    currentRows: number;
    estimatedMaxRows: number;
    usagePercent: number;
  };
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  listings: "New Listings Alerts",
  valuation: "Home Valuation Requests",
  call: "Consultation Requests",
  newsletter: "Newsletter Subscribers",
};

const SOURCE_COLORS: Record<LeadSource, string> = {
  listings: "bg-blue-500",
  valuation: "bg-emerald-500",
  call: "bg-amber-500",
  newsletter: "bg-purple-500",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function LeadTable({ leads, source }: { leads: Lead[]; source: LeadSource }) {
  if (leads.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No leads from this source yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-600 uppercase">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            {source === "valuation" && <th className="px-4 py-3">Address</th>}
            {source === "call" && <th className="px-4 py-3">Message</th>}
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {lead.fullName}
              </td>
              <td className="px-4 py-3">
                <a
                  href={`mailto:${lead.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {lead.email}
                </a>
              </td>
              <td className="px-4 py-3">
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              {source === "valuation" && (
                <td className="max-w-[200px] truncate px-4 py-3">
                  {lead.address ?? <span className="text-gray-400">—</span>}
                </td>
              )}
              {source === "call" && (
                <td className="max-w-[200px] truncate px-4 py-3">
                  {lead.message ?? <span className="text-gray-400">—</span>}
                </td>
              )}
              <td className="px-4 py-3 text-gray-500">
                {formatDate(lead.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DatabaseUsageCard({ usage }: { usage: LeadsData["dbUsage"] }) {
  const getUsageColor = (percent: number) => {
    if (percent >= 80) return "bg-red-500";
    if (percent >= 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Database Usage
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Leads stored</span>
          <span className="font-medium text-gray-900">
            {usage.currentRows.toLocaleString()} /{" "}
            {usage.estimatedMaxRows.toLocaleString()}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-500 ${getUsageColor(usage.usagePercent)}`}
            style={{ width: `${Math.min(usage.usagePercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {usage.usagePercent.toFixed(1)}% of estimated capacity used
        </p>
        {usage.usagePercent >= 60 && (
          <p className="mt-2 text-xs text-amber-600">
            Consider exporting and clearing old leads to free up space.
          </p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [leadsData, setLeadsData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Fetch leads data
    const fetchLeads = async () => {
      try {
        const response = await fetch("/api/leads");
        if (!response.ok) {
          throw new Error("Failed to fetch leads");
        }
        const data = (await response.json()) as { data: LeadsData };
        setLeadsData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    void fetchLeads();
  }, [session, sessionLoading, router]);

  // Loading state
  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not authorized
  if (session?.user?.role !== "admin") {
    return null;
  }

  const sources: LeadSource[] = ["listings", "valuation", "call", "newsletter"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Lead Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track all your leads
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
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Total leads */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Total Leads</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {leadsData?.totalCount ?? 0}
            </p>
          </div>

          {/* Per-source counts */}
          {sources.map((source) => (
            <div
              key={source}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${SOURCE_COLORS[source]}`}
                />
                <p className="text-sm font-medium text-gray-600">
                  {SOURCE_LABELS[source]}
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {leadsData?.bySource[source]?.length ?? 0}
              </p>
            </div>
          ))}
        </div>

        {/* Database Usage */}
        {leadsData?.dbUsage && (
          <div className="mb-8">
            <DatabaseUsageCard usage={leadsData.dbUsage} />
          </div>
        )}

        {/* Lead Tables by Source */}
        <div className="space-y-8">
          {sources.map((source) => (
            <div
              key={source}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div
                  className={`h-4 w-4 rounded-full ${SOURCE_COLORS[source]}`}
                />
                <h2 className="text-lg font-semibold text-gray-900">
                  {SOURCE_LABELS[source]}
                </h2>
                <span className="ml-auto rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
                  {leadsData?.bySource[source]?.length ?? 0} leads
                </span>
              </div>
              <LeadTable
                leads={leadsData?.bySource[source] ?? []}
                source={source}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
