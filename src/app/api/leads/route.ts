import { z } from "zod";
import {
  withApiHandler,
  parseAndValidateBody,
} from "@/utils/api/route-helpers";
import { Lead } from "@/utils/leads/lead";
import { LEAD_SOURCES, type LeadSource } from "@/utils/leads/types";
import { createLogger } from "@/lib/logger";
import { getEmailService } from "@/server/email";
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
 * POST /api/leads
 * Public endpoint - creates a new lead
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

    // Send email notification to the realtor (fire-and-forget: a failed
    // email should never prevent the lead from being saved).
    const emailService = getEmailService();
    emailService
      .sendLeadNotification(leadInstance.toEmailData())
      .catch((err) => {
        log.error("Unexpected email notification error", err);
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
