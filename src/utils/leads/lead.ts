import {db} from "@/server/db";
import {lead} from "@/server/db/schema";
import type {ILead, ILeadCreateInput, ILeadEmailData} from "./types";

export class Lead implements ILead {
	id?: string;
	fullName: string;
	email: string;
	phone?: string | null;
	message?: string | null;
	address?: string | null;
	source: ILead["source"];
	realtorId: string;
	createdAt?: Date;

	constructor(data: ILeadCreateInput) {
		this.fullName = data.fullName;
		this.email = data.email;
		this.phone = data.phone ?? null;
		this.message = data.message ?? null;
		this.address = data.address ?? null;
		this.source = data.source;
		this.realtorId = data.realtorId;
		this.createdAt = new Date();
	}

	/**
	 * Save the lead to the database
	 */
	async save(): Promise<ILead> {
		const result = await db
			.insert(lead)
			.values({
				fullName: this.fullName,
				email: this.email,
				phone: this.phone,
				message: this.message,
				address: this.address,
				source: this.source,
				realtorId: this.realtorId,
			})
			.returning();

		const inserted = result[0];
		if (!inserted) {
			throw new Error("Failed to insert lead");
		}

		this.id = inserted.id;
		this.createdAt = inserted.createdAt;

		return this.toJSON();
	}

	/**
	 * Get data formatted for email notification
	 */
	toEmailData(): ILeadEmailData {
		return {
			fullName: this.fullName,
			email: this.email,
			phone: this.phone,
			message: this.message,
			address: this.address,
			source: this.source,
			realtorId: this.realtorId,
			createdAt: this.createdAt ?? new Date(),
		};
	}

	/**
	 * Serialize lead to plain object
	 */
	toJSON(): ILead {
		return {
			id: this.id,
			fullName: this.fullName,
			email: this.email,
			phone: this.phone,
			message: this.message,
			address: this.address,
			source: this.source,
			realtorId: this.realtorId,
			createdAt: this.createdAt,
		};
	}

	/**
	 * Get a human-readable source label
	 */
	getSourceLabel(): string {
		const labels: Record<ILead["source"], string> = {
			listings: "New Listings Alert",
			valuation: "Home Valuation Request",
			call: "Consultation Request",
			newsletter: "Newsletter Subscription",
		};
		return labels[this.source];
	}
}
