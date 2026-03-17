import {betterAuth, type BetterAuthOptions} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {dash} from "@better-auth/infra";

import {env} from "@/env";
import {db} from "@/server/db";
import {buildSocialProviders} from "@/server/better-auth/social-providers";

function getAuthOptions(): BetterAuthOptions {
	return {
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(db, {
			provider: "pg",
		}),
		emailAndPassword: {
			enabled: true,
		},
		socialProviders: buildSocialProviders(env),
		plugins: [...(env.BETTER_AUTH_API_KEY ? [dash({apiKey: env.BETTER_AUTH_API_KEY})] : [])],
		advanced: {
			ipAddress: {
				/**
				 * Headers checked in order of priority to resolve the real client IP
				 * behind reverse proxies. Covers Vercel and Cloudflare deployments.
				 *
				 * - x-vercel-forwarded-for  : set by Vercel's edge network
				 * - cf-connecting-ip        : set by Cloudflare's proxy
				 * - x-forwarded-for         : standard proxy header (fallback)
				 */
				ipAddressHeaders: ["x-vercel-forwarded-for", "cf-connecting-ip", "x-forwarded-for"],
			},
		},
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
