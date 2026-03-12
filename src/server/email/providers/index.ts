/**
 * Provider registry.
 *
 * Central place to instantiate the active email provider.
 * When adding a new provider (e.g. Microsoft Graph, Zapier):
 *   1. Create the provider class in this directory
 *   2. Add a new branch below keyed on an env flag or provider name
 *
 * Currently only Resend is implemented.
 */

import { env } from "@/env";
import { ResendProvider } from "./resend-provider";
import type { EmailProvider } from "../types";

export { ResendProvider } from "./resend-provider";

/**
 * Create the configured email provider.
 *
 * This factory is intentionally simple today (one provider). When you
 * introduce a second provider, switch on an env variable like
 * `EMAIL_PROVIDER=resend|graph|zapier`.
 */
export function createEmailProvider(): EmailProvider {
  // Future: read process.env.EMAIL_PROVIDER and branch here.
  return new ResendProvider(env.RESEND_API_KEY);
}
