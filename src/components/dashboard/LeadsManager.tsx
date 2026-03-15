"use client";

import { useState, useEffect } from "react";
import type { LeadSource } from "@/utils/leads/types";
import {
  ChevronDown,
  ChevronUp,
  LayoutList,
  StretchHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  listings: "New Listings",
  valuation: "Home Valuation",
  call: "Consultation",
  newsletter: "Newsletter",
};

const SOURCE_COLORS: Record<LeadSource, string> = {
  listings: "bg-blue-500",
  valuation: "bg-emerald-500",
  call: "bg-amber-500",
  newsletter: "bg-purple-500",
};

/**
 * Formats a date string into a human-readable format.
 * @param dateStr - ISO date string from the database
 * @returns Formatted date string (e.g., "Jan 15, 2026, 3:45 PM")
 */
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

/**
 * Renders a table of leads with columns that adapt based on the source type.
 * @param leads - Array of lead objects to display
 * @param source - Optional lead source to determine column visibility
 * @param showSourceCol - Whether to show the source column (for unified view)
 */
function LeadTable({
  leads,
  source,
  showSourceCol = false,
}: {
  leads: Lead[];
  source?: LeadSource;
  showSourceCol?: boolean;
}) {
  if (leads.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">No leads found.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-600 uppercase">
          <tr>
            {showSourceCol && (
              <th className="w-[15%] border-r border-gray-200 px-4 py-3">
                Source
              </th>
            )}
            <th className="w-[20%] border-r border-gray-200 px-4 py-3">Name</th>
            <th className="w-[20%] border-r border-gray-200 px-4 py-3">
              Email
            </th>
            {/* Logic for Phone column */}
            {(showSourceCol ||
              (source !== "valuation" && source !== "newsletter")) && (
              <th className="w-[15%] border-r border-gray-200 px-4 py-3">
                Phone
              </th>
            )}
            {/* Logic for Details/Address/Message column */}
            {(showSourceCol || source === "valuation" || source === "call") && (
              <th className="w-[20%] border-r border-gray-200 px-4 py-3">
                {showSourceCol
                  ? "Details"
                  : source === "valuation"
                    ? "Address"
                    : "Message"}
              </th>
            )}
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              {showSourceCol && (
                <td className="border-r border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${SOURCE_COLORS[lead.source]}`}
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {SOURCE_LABELS[lead.source]}
                    </span>
                  </div>
                </td>
              )}
              <td className="border-r border-gray-100 px-4 py-3 font-medium text-gray-900">
                {lead.fullName}
              </td>
              <td className="border-r border-gray-100 px-4 py-3">
                <a
                  href={`mailto:${lead.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {lead.email}
                </a>
              </td>

              {/* Phone Cell */}
              {(showSourceCol ||
                (source !== "valuation" && source !== "newsletter")) && (
                <td className="border-r border-gray-100 px-4 py-3">
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
              )}

              {/* Details/Address/Message Cell */}
              {(showSourceCol ||
                source === "valuation" ||
                source === "call") && (
                <td className="max-w-50 truncate border-r border-gray-100 px-4 py-3">
                  {lead.source === "valuation" && lead.address ? (
                    <span title={lead.address}>{lead.address}</span>
                  ) : lead.source === "call" && lead.message ? (
                    <span title={lead.message}>{lead.message}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
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

/**
 * Displays database storage usage with a progress bar.
 * Shows a warning when usage exceeds 60% and critical alert at 80%.
 * @param usage - Object containing current rows, max rows, and usage percentage
 */
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

/**
 * Main component for managing and displaying leads in the admin dashboard.
 * Handles data fetching, view toggling (by source/unified), and rendering
 * lead tables with filtering and expansion capabilities.
 */
export function LeadsManager() {
  const [leadsData, setLeadsData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [isUnified, setIsUnified] = useState(false);
  const [expandedSources, setExpandedSources] = useState<
    Record<LeadSource, boolean>
  >({
    listings: true,
    valuation: true,
    call: true,
    newsletter: true,
  });

  const toggleSource = (source: LeadSource) => {
    setExpandedSources((prev) => ({
      ...prev,
      [source]: !prev[source],
    }));
  };

  useEffect(() => {
    // Fetch leads data
    const fetchLeads = async () => {
      try {
        const response = await fetch("/api/leads");
        if (!response.ok) {
          throw new Error("Failed to fetch leads");
        }
        const data = (await response.json()) as LeadsData;
        setLeadsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    void fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
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

  const sources: LeadSource[] = ["listings", "valuation", "call", "newsletter"];

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
        <div>
          <DatabaseUsageCard usage={leadsData.dbUsage} />
        </div>
      )}

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setIsUnified(false)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              !isUnified
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-900",
            )}
          >
            <LayoutList className="h-4 w-4" />
            By Source
          </button>
          <button
            onClick={() => setIsUnified(true)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isUnified
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-900",
            )}
          >
            <StretchHorizontal className="h-4 w-4" />
            Unified View
          </button>
        </div>
      </div>

      {/* Lead Tables */}
      {isUnified ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">All Leads</h2>
          </div>
          <LeadTable leads={leadsData?.leads ?? []} showSourceCol={true} />
        </div>
      ) : (
        <div className="space-y-8">
          {sources.map((source) => (
            <div
              key={source}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                onClick={() => toggleSource(source)}
                className="flex w-full items-center gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4 transition-colors hover:bg-gray-100"
              >
                <div
                  className={`h-4 w-4 rounded-full ${SOURCE_COLORS[source]}`}
                />
                <h2 className="text-lg font-semibold text-gray-900">
                  {SOURCE_LABELS[source]}
                </h2>
                <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
                  {leadsData?.bySource[source]?.length ?? 0} leads
                </span>
                <div className="ml-auto">
                  {expandedSources[source] ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </button>
              {expandedSources[source] && (
                <LeadTable
                  leads={leadsData?.bySource[source] ?? []}
                  source={source}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
