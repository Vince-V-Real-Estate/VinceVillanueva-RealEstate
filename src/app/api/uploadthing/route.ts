import {NextResponse, type NextRequest} from "next/server";
import {createRouteHandler} from "uploadthing/next";

import {getSession} from "@/server/better-auth/server";
import {createLogger} from "@/lib/logger";
import {uploadRouter} from "./core";

const log = createLogger("uploadthing");

const {GET: utGet, POST: utPost} = createRouteHandler({
	router: uploadRouter,
});

function isUploadThingHookRequest(request: NextRequest): boolean {
	const hook = request.headers.get("uploadthing-hook");
	return hook === "callback" || hook === "error";
}

/**
 * Gate client-initiated UploadThing requests behind an authenticated session.
 * Server-to-server UploadThing hook callbacks are exempt because they do not
 * include browser cookies; signature verification is handled by UploadThing.
 */
async function requireSession(request: NextRequest, handler: (req: NextRequest) => Promise<Response>): Promise<Response> {
	if (isUploadThingHookRequest(request)) {
		return handler(request);
	}

	const session = await getSession();

	if (!session?.user) {
		log.warn("Unauthenticated uploadthing request blocked", {
			method: request.method,
			url: request.url,
		});

		return NextResponse.json({error: "Unauthorized"}, {status: 401});
	}

	return handler(request);
}

export const GET = (req: NextRequest) => requireSession(req, utGet);
export const POST = (req: NextRequest) => requireSession(req, utPost);
