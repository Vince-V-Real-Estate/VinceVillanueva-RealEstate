import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandler } from "uploadthing/next";

import { getSession } from "@/server/better-auth/server";
import { createLogger } from "@/lib/logger";
import { uploadRouter } from "./core";

const log = createLogger("uploadthing");

const { GET: utGet, POST: utPost } = createRouteHandler({
  router: uploadRouter,
});

/**
 * Gate every UploadThing request behind an authenticated session.
 * Individual file-route middleware still enforces role-level checks,
 * but this prevents unauthenticated traffic from reaching UploadThing at all.
 */
async function requireSession(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>,
): Promise<Response> {
  const session = await getSession();

  if (!session?.user) {
    log.warn("Unauthenticated uploadthing request blocked", {
      method: request.method,
      url: request.url,
    });

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return handler(request);
}

export const GET = (req: NextRequest) => requireSession(req, utGet);
export const POST = (req: NextRequest) => requireSession(req, utPost);
