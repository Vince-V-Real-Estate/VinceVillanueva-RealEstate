import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/better-auth";
type NextJsHandlerInput = {
  handler: (request: Request) => Promise<Response>;
};
export const { GET, POST } = toNextJsHandler(auth as NextJsHandlerInput);
