import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { env } from "@/env";
import { db } from "@/server/db";
import { buildSocialProviders } from "@/server/better-auth/social-providers";

function getAuthOptions(): BetterAuthOptions {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: buildSocialProviders(env),
    user: {
      deleteUser: {
        enabled: true,
      },
      additionalFields: {
        firstName: {
          type: "string",
          required: false,
          input: false,
          fieldName: "firstName",
        },
        lastName: {
          type: "string",
          required: false,
          input: false,
          fieldName: "lastName",
        },
        role: {
          type: "string",
          required: false,
          defaultValue: "client",
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            // Split name into firstName and lastName for DB storage
            const nameParts = (user.name ?? "").trim().split(/\s+/);
            const firstName = nameParts[0] ?? "";
            const lastName = nameParts.slice(1).join(" ") || firstName;

            return {
              data: {
                ...user,
                firstName,
                lastName,
              },
            };
          },
        },
      },
    },
  };
}

export function createAuth() {
  return betterAuth(getAuthOptions());
}

export const auth = createAuth();

export type Auth = ReturnType<typeof createAuth>;

export type Session = Auth["$Infer"]["Session"];
