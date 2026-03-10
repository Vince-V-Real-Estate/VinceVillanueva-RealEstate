import { z } from "zod";
import {
  withApiHandler,
  parseAndValidateBody,
} from "@/utils/api/route-helpers";
import { Lead } from "@/utils/leads/lead";
import { LEAD_SOURCES, type LeadSource } from "@/utils/leads/types";
import { createLogger } from "@/lib/logger";
import { env } from "@/env";
import { db } from "@/server/db";
import { user, lead } from "@/server/db/schema";
import { eq, desc, sql, type InferSelectModel } from "drizzle-orm";

/** Row type inferred from the `lead` table schema. */
type LeadRow = InferSelectModel<typeof lead>;

const log = createLogger("leads-api");

/**
 * Estimated max rows for a free/hobby PostgreSQL tier (e.g., Supabase, Neon)
 * Adjust based on your actual database limits
 */
const ESTIMATED_MAX_ROWS = 10000;

/**
 * Zapier webhook URL for spreadsheet integration
 */
const ZAPIER_WEBHOOK_URL = env.ZAPIER_WEBHOOK_URL;

/**
 * Zod schema for lead submission validation
 */
const createLeadSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[+]?[\d\s()-]{10,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(1000, "Message cannot exceed 1000 characters")
    .optional(),
  address: z
    .string()
    .max(200, "Address cannot exceed 200 characters")
    .optional(),
  source: z.enum(LEAD_SOURCES, {
    errorMap: () => ({ message: "Invalid lead source" }),
  }),
});

/**
 * Gets a human-readable label for a lead source.
 */
function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    listings: "Get New Listings",
    valuation: "Home Valuation Request",
    call: "Schedule a Call",
    newsletter: "Newsletter Subscription",
  };
  return labels[source] ?? source;
}

/**
 * Formats a date to MM-DD-YYYY format.
 */
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

/**
 * Sends lead data to Zapier webhook for spreadsheet integration.
 */
async function sendToZapier(data: {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  message?: string;
  source: string;
  createdAt: Date;
}): Promise<boolean> {
  // Skip if webhook URL not configured
  if (!ZAPIER_WEBHOOK_URL) {
    log.warn("Zapier webhook URL not configured, skipping");
    return false;
  }

  try {
    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone ?? "",
        address: data.address ?? "",
        message: data.message ?? "",
        source: getSourceLabel(data.source),
        createdAt: formatDate(data.createdAt),
      }),
    });

    if (!response.ok) {
      log.error("Zapier webhook failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    log.info("Lead sent to Zapier", { email: data.email, source: data.source });
    return true;
  } catch (error) {
    log.error("Failed to send lead to Zapier", error);
    return false;
  }
}

/**
 * POST /api/leads
 * Public endpoint - creates a new lead and sends to Zapier webhook
 */
export const POST = withApiHandler(
  { endpoint: "/api/leads", method: "POST", requireAuth: false },
  async (request) => {
    // Validate request body
    const result = await parseAndValidateBody(request, createLeadSchema);
    if ("error" in result) return result.error;

    const { fullName, email, phone, message, address, source } = result.data;

    // Get the admin user (realtor) who owns all leads
    const adminUser = await db.query.user.findFirst({
      where: eq(user.role, "admin"),
    });

    if (!adminUser) {
      log.error("No admin user found in database");
      return {
        data: { success: false, message: "System configuration error" },
        status: 500,
      };
    }

    // Create and save lead to database (empty strings become undefined)
    const leadInstance = new Lead({
      fullName,
      email,
      phone: phone === "" ? undefined : phone,
      message: message === "" ? undefined : message,
      address: address === "" ? undefined : address,
      source,
      realtorId: adminUser.id,
    });

    const savedLead = await leadInstance.save();
    log.info("Lead created", { id: savedLead.id, source });

    // Send to Zapier webhook (non-blocking - don't fail if webhook fails)
    sendToZapier({
      fullName,
      email,
      phone: phone === "" ? undefined : phone,
      address: address === "" ? undefined : address,
      message: message === "" ? undefined : message,
      source,
      createdAt: new Date(),
    }).catch((error) => {
      log.error("Failed to send lead to Zapier webhook", error);
    });

    return {
      data: {
        success: true,
        message: "Thank you! We'll be in touch soon.",
        lead: {
          id: savedLead.id,
          fullName: savedLead.fullName,
          source: savedLead.source,
        },
      },
      status: 201,
    };
  },
);

/**
 * GET /api/leads
 * Admin-only endpoint - retrieves all leads grouped by source
 */
export const GET = withApiHandler(
  { endpoint: "/api/leads", method: "GET", requireRole: "admin" },
  async (_request, { session }) => {
    // Session is guaranteed by requireRole: "admin"
    const userId = session!.user.id;

    // Get all leads for this realtor, ordered by most recent
    const allLeads: LeadRow[] = await db
      .select()
      .from(lead)
      .where(eq(lead.realtorId, userId))
      .orderBy(desc(lead.createdAt));

    // Group leads by source
    const bySource: Record<LeadSource, LeadRow[]> = {
      listings: [],
      valuation: [],
      call: [],
      newsletter: [],
    };

    for (const l of allLeads) {
      const bucket = bySource[l.source];
      if (!bucket) {
        log.warn("Skipping lead with unknown source", {
          source: l.source,
          id: l.id,
        });
        continue;
      }
      bucket.push(l);
    }

    // Get total row count for database usage
    const countResult: { count: number }[] = await db
      .select({ count: sql<number>`count(*)` })
      .from(lead);
    const currentRows = Number(countResult[0]?.count ?? 0);

    return {
      data: {
        leads: allLeads,
        totalCount: allLeads.length,
        bySource,
        dbUsage: {
          currentRows,
          estimatedMaxRows: ESTIMATED_MAX_ROWS,
          usagePercent: (currentRows / ESTIMATED_MAX_ROWS) * 100,
        },
      },
    };
  },
);
