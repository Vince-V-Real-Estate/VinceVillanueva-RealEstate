import { Resend } from "resend";
import { createLogger } from "@/lib/logger";
import type { EmailProvider, EmailMessage, EmailResult } from "../types";

const log = createLogger("email-resend");

/**
 * Email provider backed by the Resend transactional email API.
 *
 * @see https://resend.com/docs
 */
export class ResendProvider implements EmailProvider {
  readonly name = "resend";
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const { data, error } = await this.client.emails.send({
        from: message.from,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        replyTo: message.replyTo,
      });

      if (error) {
        log.error("Resend API error", { error });
        return { success: false, error: error.message };
      }

      log.info("Email sent via Resend", { messageId: data?.id });
      return { success: true, messageId: data?.id };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown Resend error";
      log.error("Resend send failure", err);
      return { success: false, error: errorMessage };
    }
  }
}
