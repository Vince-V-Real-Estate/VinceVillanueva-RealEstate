/**
 * High-level email service.
 *
 * Orchestrates email providers and templates. Business logic calls
 * methods on this service; it picks the right template, builds the
 * HTML, and delegates delivery to the configured {@link EmailProvider}.
 *
 * The service is provider-agnostic — swap Resend for another provider
 * by changing the factory in `providers/index.ts`.
 */

import {env} from "@/env";
import {createLogger} from "@/lib/logger";
import type {ILeadEmailData} from "@/utils/leads/types";
import type {EmailProvider, EmailResult} from "./types";
import {createEmailProvider} from "./providers";
import {buildLeadNotificationHtml, buildLeadNotificationSubject} from "./templates";

const log = createLogger("email-service");

export class EmailService {
	private provider: EmailProvider;

	constructor(provider?: EmailProvider) {
		this.provider = provider ?? createEmailProvider();
	}

	/**
	 * Send a lead-notification email to the realtor.
	 *
	 * Called automatically after a new lead is persisted.
	 * Uses `RESEND_TO` (the realtor's inbox) and `RESEND_FROM`
	 * (the verified sender address) from env.
	 */
	async sendLeadNotification(data: ILeadEmailData): Promise<EmailResult> {
		const subject = buildLeadNotificationSubject(data);
		const html = buildLeadNotificationHtml(data);

		log.info("Sending lead notification", {
			to: env.RESEND_TO,
			source: data.source,
			leadName: data.fullName,
		});

		const result = await this.provider.send({
			to: env.RESEND_TO,
			from: env.RESEND_FROM,
			subject,
			html,
			replyTo: data.email,
		});

		if (!result.success) {
			log.error("Lead notification failed", {
				error: result.error,
				source: data.source,
				leadEmail: data.email,
			});
		}

		return result;
	}
}

// ---------------------------------------------------------------------------
// Singleton (mirrors the auth pattern: factory + singleton export)
// ---------------------------------------------------------------------------

/** Lazily-initialised singleton for use in API routes / server actions. */
let _instance: EmailService | null = null;

export function getEmailService(): EmailService {
	_instance ??= new EmailService();
	return _instance;
}
