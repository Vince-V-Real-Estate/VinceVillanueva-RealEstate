import type { LeadsData } from "./types";

interface DatabaseUsageCardProps {
  usage: LeadsData["dbUsage"];
}

/**
 * Displays database storage usage with a progress bar.
 * Shows a warning when usage exceeds 60% and critical alert at 80%.
 * @param usage - Object containing current rows, max rows, and usage percentage
 */
/**
 * Determines the background color class based on the usage percentage.
 * @param {number} percent - The usage percentage to evaluate.
 * @returns {string} The Tailwind color class for the usage bar.
 */
export function DatabaseUsageCard({ usage }: DatabaseUsageCardProps) {
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
