/**
 * Core email abstractions.
 *
 * The {@link EmailProvider} interface decouples the application from any
 * specific vendor SDK.  Resend is the primary transactional email
 * provider.  Future integrations (Zapier webhooks, Microsoft Graph API
 * for Excel automation, etc.) live in `src/server/email/providers/` and
 * work **alongside** Resend — they do not replace it.
 */

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------

/** Payload accepted by every email provider. */
export interface EmailMessage {
  /** Recipient address(es). */
  to: string | string[];
  /** RFC 5322 "From" header, e.g. `"VV Realty <noreply@example.com>"`. */
  from: string;
  /** Email subject line. */
  subject: string;
  /** Full HTML body (inline-styled for cross-client compat). */
  html: string;
  /** Optional reply-to address. */
  replyTo?: string;
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

/** Normalised result returned by every provider after a send attempt. */
export interface EmailResult {
  /** Whether the provider accepted the message for delivery. */
  success: boolean;
  /** Provider-assigned message ID (useful for debugging / logs). */
  messageId?: string;
  /** Human-readable error description when `success` is `false`. */
  error?: string;
}

// ---------------------------------------------------------------------------
// Provider contract
// ---------------------------------------------------------------------------

/**
 * Vendor-agnostic email provider.
 *
 * To add a new provider (e.g. Microsoft Graph, Zapier webhook):
 * 1. Create a file in `src/server/email/providers/`
 * 2. Implement this interface
 * 3. Register it in `src/server/email/providers/index.ts`
 */
export interface EmailProvider {
  /** Human-readable provider name (for logging). */
  readonly name: string;

  /**
   * Send a single email.
   *
   * Implementations MUST NOT throw — they should catch errors internally
   * and return `{ success: false, error: "..." }` instead.
   */
  send(message: EmailMessage): Promise<EmailResult>;
}
