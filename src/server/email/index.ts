/**
 * Email module barrel.
 *
 * ```ts
 * import { getEmailService } from "@/server/email";
 *
 * const emailService = getEmailService();
 * await emailService.sendLeadNotification(lead.toEmailData());
 * ```
 */

// Service
export {EmailService, getEmailService} from "./service";

// Types (re-exported for convenience)
export type {EmailProvider, EmailMessage, EmailResult} from "./types";

// Providers (for advanced / testing use)
export {createEmailProvider, ResendProvider} from "./providers";

// Templates (for previewing / testing)
export {buildLeadNotificationHtml, buildLeadNotificationSubject} from "./templates";
