# VV Realtor Agent Operating Spec

This document is for autonomous coding agents. It captures constraints and patterns specific to this realtor website project.

## 1) Context Budgeting

- Start from the task surface; load only relevant modules.
- For auth/runtime issues: load `src/server/better-auth/*`, `src/server/db/index.ts`, `src/env.js` first.
- For database changes: load `src/server/db/schema.ts` and `drizzle.config.ts`.
- For API routes: utilize `` load the specific route file and any helper modules.

## 2) Runtime and Boundary Invariants

- Keep auth and DB client creation request-scoped; use `createAuth()` factory pattern, not module-level exports (except the singleton `auth` export for server actions).
- Keep `getSession()` uncached; do not wrap with React `cache()`.
- Keep server-only logic in `src/server/**`; never import server modules into client components.
- Use `.js` extension for env files (Next.js requirement for env validation).

## 3) Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Auth**: Better Auth v1.x
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Validation**: Zod

## 4) Database Patterns

- Use Drizzle for all database operations
- Drizzle config is in `drizzle.config.ts`
- Run migrations with `bun db:migrate`
- Push schema changes with `bun db:push`
- Generate types with `bun db:generate`

## 5) Auth Patterns

- Server auth instance: `createAuth()` from `@/server/better-auth`
- Server actions use singleton `auth` export from `@/server/better-auth`
- Client auth: `authClient` from `@/server/better-auth/client`
- Social providers configured in `src/server/better-auth/social-providers.ts`

## 6) API Route Patterns

- Auth routes mounted at `src/app/api/auth/[...all]/route.ts` — handled natively by Better Auth; do NOT create separate auth route files
- All CRUD/API route handlers MUST use `withApiHandler` from `src/utils/api/route-helpers.ts`
- Use `parseAndValidateBody` for Zod validation of request bodies inside handlers
- Use Next.js App Router conventions
- Handle errors with consistent response shapes (handled automatically by `withApiHandler`)

### `withApiHandler` usage

```ts
import { withApiHandler, parseAndValidateBody } from "@/utils/api/route-helpers";

// Protected route (requireAuth defaults to true)
export const GET = withApiHandler(
  { endpoint: "/api/listings", method: "GET" },
  async (_request, { session, params }) => {
    const listings = await db.query.listings.findMany();
    return { data: { listings } };
  }
);

// Public route
export const GET = withApiHandler(
  { endpoint: "/api/listings/[id]", method: "GET", requireAuth: false },
  async (_request, { params }) => {
    const listing = await db.query.listings.findFirst({ ... });
    return { data: { listing } };
  }
);

// Admin-only route with body validation
export const POST = withApiHandler(
  { endpoint: "/api/admin/listings", method: "POST", requireRole: "admin" },
  async (request, { session }) => {
    const result = await parseAndValidateBody(request, createListingSchema);
    if ("error" in result) return result.error;
    const newListing = await db.insert(listings).values(result.data).returning();
    return { data: { listing: newListing }, status: 201 };
  }
);
```

### Config options

| Option        | Type                            | Default | Description                                |
| ------------- | ------------------------------- | ------- | ------------------------------------------ |
| `endpoint`    | `string`                        | —       | Path for logging (e.g., `"/api/listings"`) |
| `method`      | `GET\|POST\|PATCH\|PUT\|DELETE` | —       | HTTP method                                |
| `requireAuth` | `boolean`                       | `true`  | Returns 401 when no valid session exists   |
| `requireRole` | `"client" \| "admin"`           | —       | Returns 403 if user role doesn't match     |

## 7) Quality Gates

Before opening a PR, run:

```
bun check        # lint + typescript
bun format:check # prettier
bun build        # ensure production build works
```

## 8) High-Risk Paths (Require Extra Scrutiny)

- `src/server/better-auth/**`
- `src/server/db/**`
- `drizzle.config.ts`
- `src/env.js`

## 9) Minimum Verification

- Ask first before database changes
- Ask first before committing or pushing changes to github
- Run `bun check` for lint/type errors
- Run `bun build` to verify compilation
- For auth changes: test sign-in/sign-out flows manually

## 10) Coding Style

- TypeScript strict mode
- Tabs for indentation
- 100 character line limit
- Prefer descriptive variable names
- camelCase variables
- PascalCase components
- Use interfaces for public APIs
- Implement all styling in TailwindCSS
<!-- - Rely on ShadCN library components when possible except for forms for lead generation that should be designed with creativity. -->

## 11) Anti-Patterns

- Do not introduce client imports of server modules
- Do not remove the auth factory pattern
- Do not bypass the quality gates before committing
- Do not use raw `console.log` / `console.error` — use `createLogger` from `@/lib/logger` instead

## 12) Logger

All logging MUST use the factory logger from `src/lib/logger.ts`. Do NOT use raw `console.log`, `console.error`, etc.

### Usage

```ts
import { createLogger } from "@/lib/logger";

const log = createLogger("my-module");

log.debug("Verbose detail", { someCtx: 123 }); // silent in production
log.info("Something happened", data); // silent in production
log.warn("Potential issue", { reason: "..." }); // always active
log.error("Operation failed", error); // always active
```

### Log levels by environment

| Environment        | Active levels            |
| ------------------ | ------------------------ |
| development / test | debug, info, warn, error |
| production         | warn, error              |

### Output format

```
[LEVEL] [scope] message ...args
```

Example: `[ERROR] [api] POST /api/listings Error: connection refused`

### Conventions

- **Scope name**: short, lowercase, kebab-case (e.g., `"api"`, `"auth"`, `"newsletter"`)
- **One logger per module**: create at module top-level, not inside functions
- **Errors**: use `log.error(message, error)` — pass the Error object as a second arg
- **Structured data**: pass objects as extra args (e.g., `log.info("Created", { id })`)

## 13) MCP

- When working with MCP, view `mcp/opencode.json`

## 14) Context Budgeting (Load Only What You Need)

- Do not ingest broad project context by default. Start from the task surface and load only relevant modules.
- For API work, prioritize: `src/utils/api/route-helpers.ts` and the target route file.
- For mortgage calculation logic, load only the specific engine under `src/utils/calculation`.
- For auth/runtime issues, load `src/server/better-auth/*`, `src/server/db/index.ts`, and `src/env.js` first.
