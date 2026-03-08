import { headers } from "next/headers";

import { createAuth, type Session } from "./config";

export const getSession = async () => {
  const auth = createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
};

export type { Session };
