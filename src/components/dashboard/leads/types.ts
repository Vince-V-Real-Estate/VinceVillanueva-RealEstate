import type {LeadSource} from "@/utils/leads/types";

export interface Lead {
	id: string;
	fullName: string;
	email: string;
	phone: string | null;
	message: string | null;
	address: string | null;
	source: LeadSource;
	createdAt: string;
}

export interface LeadsData {
	leads: Lead[];
	totalCount: number;
	bySource: Record<LeadSource, Lead[]>;
	dbUsage: {
		currentRows: number;
		estimatedMaxRows: number;
		usagePercent: number;
	};
}
