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

import type { LeadsData } from "./leads/types";
import { SOURCE_LABELS, SOURCE_COLORS } from "./leads/constants";
import { LeadTable } from "./leads/LeadTable";
import { DatabaseUsageCard } from "./leads/DatabaseUsageCard";

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

  /**
   * Toggles the expanded state of a lead source section.
   * @param {LeadSource} source - The lead source to toggle.
   * @returns {void}
   */
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
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-100 items-center justify-center">
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
