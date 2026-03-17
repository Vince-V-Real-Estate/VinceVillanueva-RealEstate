import {getSession, type Session} from "@/server/better-auth/server";
import {createLogger} from "@/lib/logger";
import {type NextRequest, NextResponse} from "next/server";
import type {ZodError, ZodSchema} from "zod";

const log = createLogger("api");

/**
 * Context passed to every API route handler.
 * Contains the authenticated session, resolved URL params,
 * and any additional validated resource IDs.
 */
export interface RouteContext<TResourceIds extends Record<string, string> = Record<string, string>> {
	/** The authenticated user session (only present when requireAuth is true) */
	session: Session | null;
	/** Resolved dynamic route params (e.g., { id: "abc123" }) */
	params: Record<string, string>;
	/**
	 * Validated resource IDs extracted from params.
	 * Empty object when `paramsSchema` is not configured.
	 */
	resourceIds: TResourceIds;
}

/**
 * Configuration options for the API handler wrapper.
 * Controls authentication, role-based access, and logging context.
 */
export interface ApiHandlerConfig<TResourceIds extends Record<string, string> = Record<string, string>> {
	/**
	 * Endpoint path for logging and debugging.
	 * Use bracket placeholders for dynamic segments (e.g., "/api/listings/[id]").
	 */
	endpoint: string;

	/** HTTP method this handler responds to */
	method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

	/**
	 * Whether the route requires an authenticated session.
	 * If true, returns 401 when no valid session exists.
	 * @default true
	 */
	requireAuth?: boolean;

	/**
	 * Restrict access to users with a specific role.
	 * Only checked when requireAuth is true.
	 * Requires the user table to have a "role" column.
	 */
	requireRole?: "client" | "admin";

	/**
	 * Optional Zod schema for validating dynamic route params.
	 * Parsed values are exposed on `context.resourceIds`.
	 */
	paramsSchema?: ZodSchema<TResourceIds>;
}

/**
 * The return type for handler functions.
 * Handlers can return a NextResponse directly for full control,
 * or a simple { data, status } object that gets JSON-serialized automatically.
 */
type HandlerResult = NextResponse | {data: unknown; status?: number};

/**
 * The handler function signature.
 * Receives the raw Request and the enriched RouteContext.
 */
type ApiHandler<TResourceIds extends Record<string, string> = Record<string, string>> = (request: Request, context: RouteContext<TResourceIds>) => Promise<HandlerResult>;

/**
 * Next.js App Router context type for dynamic routes.
 * In Next.js 15, params is always a Promise.
 */
type NextRouteContext = {
	params: Promise<Record<string, string>>;
};

/**
 * Higher-order function that wraps API route handlers with common boilerplate.
 *
 * Provides:
 * - Session validation (opt-in via `requireAuth`, defaults to true)
 * - Role-based access control (opt-in via `requireRole`)
 * - Automatic param resolution from Next.js dynamic routes
 * - Optional route param validation via `paramsSchema`
 * - Consistent error handling with structured JSON responses
 * - Simple return type: return `{ data }` and it gets JSON-serialized
 *
 * @example
 * ```ts
 * // Protected route (default: requireAuth = true)
 * export const GET = withApiHandler(
 *   { endpoint: "/api/listings", method: "GET" },
 *   async (_request, { session }) => {
 *     const listings = await db.query.listings.findMany();
 *     return { data: { listings } };
 *   }
 * );
 *
 * // Public route (no auth required)
 * export const GET = withApiHandler(
 *   { endpoint: "/api/listings/[id]", method: "GET", requireAuth: false },
 *   async (_request, { params }) => {
 *     const listing = await db.query.listings.findFirst({ where: ... });
 *     return { data: { listing } };
 *   }
 * );
 *
 * // Admin-only route
 * export const DELETE = withApiHandler(
 *   { endpoint: "/api/admin/users/[id]", method: "DELETE", requireRole: "admin" },
 *   async (_request, { params }) => {
 *     await db.delete(users).where(eq(users.id, params.id));
 *     return { data: { success: true } };
 *   }
 * );
 * ```
 */
export function withApiHandler<TResourceIds extends Record<string, string> = Record<string, string>>(
	config: ApiHandlerConfig<TResourceIds>,
	handler: ApiHandler<TResourceIds>,
): (request: NextRequest, context: NextRouteContext) => Promise<NextResponse> {
	const requireAuth = config.requireAuth ?? true;

	return async (request: NextRequest, context: NextRouteContext): Promise<NextResponse> => {
		/** Resolve Next.js dynamic route params (always a Promise in Next.js 15) */
		const resolvedParams = await context.params;
		let resourceIds = {} as TResourceIds;

		try {
			// ── Step 1: Authenticate if required ──────────────────────────────
			let session: Session | null = null;

			if (requireAuth) {
				session = await getSession();

				if (!session?.user) {
					return NextResponse.json({error: "Unauthorized"}, {status: 401});
				}

				// ── Step 2: Check role if specified ────────────────────────────
				if (config.requireRole) {
					const userRole = (session.user as Record<string, unknown>).role;

					if (userRole !== config.requireRole) {
						return NextResponse.json({error: "Forbidden: insufficient permissions"}, {status: 403});
					}
				}
			}

			// ── Step 3: Validate route params when schema is provided ─────────
			if (config.paramsSchema) {
				const paramsResult = config.paramsSchema.safeParse(resolvedParams);

				if (!paramsResult.success) {
					return NextResponse.json(
						{
							error: "Validation failed",
							details: formatZodErrors(paramsResult.error),
						},
						{status: 400},
					);
				}

				resourceIds = paramsResult.data;
			}

			// ── Step 4: Execute the route handler ─────────────────────────────
			const result = await handler(request, {
				session,
				params: resolvedParams,
				resourceIds,
			});

			// ── Step 5: Normalize the response ────────────────────────────────
			if (result instanceof NextResponse) {
				return result;
			}

			return NextResponse.json(result.data, {
				status: result.status ?? 200,
			});
		} catch (error) {
			// ── Catch-all error handler ───────────────────────────────────────
			log.error(`${config.method} ${config.endpoint}`, error instanceof Error ? error.message : error);

			return NextResponse.json({error: "Internal server error"}, {status: 500});
		}
	};
}

/**
 * Parses and validates a JSON request body against a Zod schema.
 * Returns the validated data or a structured 400 error response.
 *
 * @example
 * ```ts
 * const result = await parseAndValidateBody(request, createListingSchema);
 * if ("error" in result) return result.error;
 * const { title, price } = result.data;
 * ```
 */
export async function parseAndValidateBody<T>(request: Request, schema: ZodSchema<T>): Promise<{data: T} | {error: NextResponse}> {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return {
			error: NextResponse.json({error: "Invalid JSON body"}, {status: 400}),
		};
	}

	const result = schema.safeParse(body);

	if (!result.success) {
		return {
			error: NextResponse.json(
				{
					error: "Validation failed",
					details: formatZodErrors(result.error),
				},
				{status: 400},
			),
		};
	}

	return {data: result.data};
}

/**
 * Formats Zod validation errors into a flat, human-readable record.
 * Maps each field path to its first error message.
 *
 * @example
 * // Input ZodError for { email: "invalid" }
 * // Output: { email: "Invalid email address" }
 */
function formatZodErrors(error: ZodError): Record<string, string> {
	const formatted: Record<string, string> = {};

	for (const issue of error.issues) {
		const path = issue.path.join(".");
		formatted[path] ??= issue.message;
	}

	return formatted;
}
