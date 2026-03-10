export const LEAD_SOURCES = [
  "listings",
  "valuation",
  "call",
  "newsletter",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface ILead {
  id?: string;
  fullName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  address?: string | null;
  source: LeadSource;
  realtorId: string;
  createdAt?: Date;
}

export interface ILeadCreateInput {
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  address?: string;
  source: LeadSource;
  realtorId: string;
}

export interface ILeadEmailData {
  fullName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  address?: string | null;
  source: LeadSource;
  realtorId: string;
  createdAt: Date;
}
