import type {LeadSource} from "@/utils/leads/types";
import type {Lead} from "./types";
import {SOURCE_COLORS, SOURCE_LABELS, formatDate} from "./constants";

interface LeadTableProps {
	leads: Lead[];
	source?: LeadSource;
	showSourceCol?: boolean;
}

/**
 * Renders a table of leads with columns that adapt based on the source type.
 * @param leads - Array of lead objects to display
 * @param source - Optional lead source to determine column visibility
 * @param showSourceCol - Whether to show the source column (for unified view)
 */
export function LeadTable({leads, source, showSourceCol = false}: LeadTableProps) {
	if (leads.length === 0) {
		return <div className="py-8 text-center text-gray-500">No leads found.</div>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse text-left text-sm">
				<thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-600 uppercase">
					<tr>
						{showSourceCol && <th className="w-[15%] border-r border-gray-200 px-4 py-3">Source</th>}
						<th className="w-[20%] border-r border-gray-200 px-4 py-3">Name</th>
						<th className="w-[20%] border-r border-gray-200 px-4 py-3">Email</th>
						{/* Logic for Phone column */}
						{(showSourceCol || (source !== "valuation" && source !== "newsletter")) && <th className="w-[15%] border-r border-gray-200 px-4 py-3">Phone</th>}
						{/* Logic for Details/Address/Message column */}
						{(showSourceCol || source === "valuation" || source === "call") && <th className="w-[20%] border-r border-gray-200 px-4 py-3">{showSourceCol ? "Details" : source === "valuation" ? "Address" : "Message"}</th>}
						<th className="px-4 py-3">Date</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{leads.map((lead) => (
						<tr
							key={lead.id}
							className="hover:bg-gray-50"
						>
							{showSourceCol && (
								<td className="border-r border-gray-100 px-4 py-3">
									<div className="flex items-center gap-2">
										<div className={`h-2 w-2 rounded-full ${SOURCE_COLORS[lead.source]}`} />
										<span className="text-xs font-medium text-gray-700">{SOURCE_LABELS[lead.source]}</span>
									</div>
								</td>
							)}
							<td className="border-r border-gray-100 px-4 py-3 font-medium text-gray-900">{lead.fullName}</td>
							<td className="border-r border-gray-100 px-4 py-3">
								<a
									href={`mailto:${lead.email}`}
									className="text-blue-600 hover:underline"
								>
									{lead.email}
								</a>
							</td>

							{/* Phone Cell */}
							{(showSourceCol || (source !== "valuation" && source !== "newsletter")) && (
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
							{(showSourceCol || source === "valuation" || source === "call") && (
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

							<td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
