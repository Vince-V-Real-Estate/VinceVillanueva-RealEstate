/**
 * Lead-notification email template.
 *
 * All styles are **inlined** so the email renders correctly in Gmail,
 * Yahoo Mail, Outlook, Apple Mail, and other major clients that strip
 * `<style>` blocks.
 */

import type { ILeadEmailData } from "@/utils/leads/types";

/** Human-readable labels for each lead source. */
const SOURCE_LABELS: Record<ILeadEmailData["source"], string> = {
  listings: "New Listings Alert",
  valuation: "Home Valuation Request",
  call: "Consultation Request",
  newsletter: "Newsletter Subscription",
};

/** Accent colour per source so the realtor can triage at a glance. */
const SOURCE_COLORS: Record<ILeadEmailData["source"], string> = {
  listings: "#2563eb",
  valuation: "#7c3aed",
  call: "#059669",
  newsletter: "#d97706",
};

/** Format a Date to a concise, human-readable string. */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Escape HTML entities to prevent XSS in email bodies. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Template builder
// ---------------------------------------------------------------------------

/**
 * Build an inline-styled HTML email for a new lead notification.
 *
 * The realtor receives this in their Gmail / Yahoo / Outlook inbox
 * whenever a visitor submits a form on the website.
 */
export function buildLeadNotificationHtml(data: ILeadEmailData): string {
  const sourceLabel = SOURCE_LABELS[data.source];
  const accent = SOURCE_COLORS[data.source];
  const submitted = formatDate(data.createdAt);

  // -- optional detail rows ------------------------------------------------
  const detailRows: string[] = [];

  detailRows.push(row("Name", esc(data.fullName)));
  detailRows.push(row("Email", emailLink(data.email)));

  if (data.phone) {
    detailRows.push(row("Phone", phoneLink(data.phone)));
  }
  if (data.address) {
    detailRows.push(row("Address", esc(data.address)));
  }
  if (data.message) {
    detailRows.push(row("Message", esc(data.message)));
  }

  detailRows.push(row("Submitted", submitted));

  return /* html */ `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(sourceLabel)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">

  <!--[if mso]>
  <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0">
  <tr><td>
  <![endif]-->

  <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0"
    style="max-width:600px;width:100%;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;margin-top:24px;margin-bottom:24px;">

    <!-- Accent bar -->
    <tr>
      <td style="height:6px;background-color:${accent};font-size:0;line-height:0;">&nbsp;</td>
    </tr>

    <!-- Header -->
    <tr>
      <td style="padding:28px 32px 12px 32px;">
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#18181b;">
          New Lead: ${esc(sourceLabel)}
        </h1>
      </td>
    </tr>

    <!-- Intro -->
    <tr>
      <td style="padding:0 32px 20px 32px;">
        <p style="margin:0;font-size:15px;line-height:1.5;color:#52525b;">
          A visitor just submitted a <strong>${esc(sourceLabel.toLowerCase())}</strong>
          form on your website. Here are the details:
        </p>
      </td>
    </tr>

    <!-- Details table -->
    <tr>
      <td style="padding:0 32px 28px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"
          style="width:100%;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;">
          ${detailRows.join("")}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:0 32px 32px 32px;">
        <a href="mailto:${esc(data.email)}?subject=Re:%20${encodeURIComponent(sourceLabel)}"
          style="display:inline-block;padding:12px 28px;background-color:${accent};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;mso-padding-alt:0;">
          <!--[if mso]>
          <i style="mso-font-width:300%;mso-text-raise:18pt">&nbsp;</i>
          <![endif]-->
          Reply to ${esc(data.fullName)}
          <!--[if mso]>
          <i style="mso-font-width:300%">&nbsp;</i>
          <![endif]-->
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #e4e4e7;">
        <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
          This is an automated notification from your VV Realty website.
          You are receiving this because a visitor submitted a form.
        </p>
      </td>
    </tr>

  </table>

  <!--[if mso]>
  </td></tr></table>
  <![endif]-->

</body>
</html>`.trim();
}

/**
 * Build a subject line for the lead notification email.
 */
export function buildLeadNotificationSubject(data: ILeadEmailData): string {
  return `New Lead: ${SOURCE_LABELS[data.source]} - ${data.fullName}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Single detail-table row with a label and value. */
function row(label: string, value: string): string {
  return `
          <tr>
            <td style="padding:10px 14px;width:100px;font-size:13px;font-weight:600;color:#71717a;vertical-align:top;border-bottom:1px solid #f4f4f5;">
              ${label}
            </td>
            <td style="padding:10px 14px;font-size:14px;color:#18181b;vertical-align:top;border-bottom:1px solid #f4f4f5;">
              ${value}
            </td>
          </tr>`;
}

/** Clickable mailto link. */
function emailLink(email: string): string {
  const safe = esc(email);
  return `<a href="mailto:${safe}" style="color:#2563eb;text-decoration:underline;">${safe}</a>`;
}

/** Clickable tel link. */
function phoneLink(phone: string): string {
  const safe = esc(phone);
  const digits = phone.replace(/[^\d+]/g, "");
  return `<a href="tel:${digits}" style="color:#2563eb;text-decoration:underline;">${safe}</a>`;
}
