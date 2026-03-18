import {betterAuth, type BetterAuthOptions} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {dash} from "@better-auth/infra";

import {env} from "@/env";
import {db} from "@/server/db";
import {buildSocialProviders} from "@/server/better-auth/social-providers";

const VERCEL_IP_ADDRESS_HEADERS = ["x-vercel-forwarded-for", "x-forwarded-for"] as const;
const CLOUDFLARE_IP_ADDRESS_HEADERS = ["cf-connecting-ip", "x-forwarded-for"] as const;

function parseIpAddressHeaders(value: string | undefined) {
	if (!value) {
		return undefined;
	}

	const headers = value
		.split(",")
		.map((header: string) => header.trim())
		.filter(Boolean);

	return headers.length > 0 ? headers : undefined;
}

function getTrustedProxyPlatform() {
	if (env.TRUSTED_PROXY_ENV) {
		return env.TRUSTED_PROXY_ENV;
	}

	if (process.env.VERCEL === "1") {
		return "vercel" as const;
	}

	if (process.env.CF_PAGES === "1" || process.env.CF_WORKER === "1") {
		return "cloudflare" as const;
	}

	return undefined;
}

function getIpAddressHeaders() {
	const platform = getTrustedProxyPlatform();

	if (!platform) {
		// Untrusted environments should not trust forwarding headers from clients.
		return [];
	}

	const configuredHeaders = parseIpAddressHeaders(env.IP_ADDRESS_HEADERS);

	if (configuredHeaders) {
		return configuredHeaders;
	}

	if (platform === "vercel") {
		return [...VERCEL_IP_ADDRESS_HEADERS];
	}

	if (platform === "cloudflare") {
		return [...CLOUDFLARE_IP_ADDRESS_HEADERS];
	}

	return [];
}

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
				ipAddressHeaders: getIpAddressHeaders(),
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
