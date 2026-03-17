import type {BetterAuthOptions} from "better-auth";

export interface OAuthEnv {
	BETTER_AUTH_GITHUB_CLIENT_ID?: string;
	BETTER_AUTH_GITHUB_CLIENT_SECRET?: string;
	BETTER_AUTH_GOOGLE_CLIENT_ID?: string;
	BETTER_AUTH_GOOGLE_CLIENT_SECRET?: string;
	BETTER_AUTH_MICROSOFT_CLIENT_ID?: string;
	BETTER_AUTH_MICROSOFT_CLIENT_SECRET?: string;
	BETTER_AUTH_MICROSOFT_TENANT_ID?: string;
}

type SocialProviders = NonNullable<BetterAuthOptions["socialProviders"]>;

/**
 * Registers a social provider when both client ID and secret are present.
 * Centralises the guard logic so each provider is a single call instead of
 * a duplicated if-block (keeps SonarQube happy).
 */
function registerProvider(providers: SocialProviders, key: keyof SocialProviders, clientId: string | undefined, clientSecret: string | undefined, extra?: Record<string, unknown>): void {
	if (clientId && clientSecret) {
		(providers as Record<string, unknown>)[key] = {
			clientId,
			clientSecret,
			...extra,
		};
	}
}

export function buildSocialProviders(env: OAuthEnv): BetterAuthOptions["socialProviders"] {
	const providers: SocialProviders = {};

	registerProvider(providers, "github", env.BETTER_AUTH_GITHUB_CLIENT_ID, env.BETTER_AUTH_GITHUB_CLIENT_SECRET);

	registerProvider(providers, "google", env.BETTER_AUTH_GOOGLE_CLIENT_ID, env.BETTER_AUTH_GOOGLE_CLIENT_SECRET);

	registerProvider(providers, "microsoft", env.BETTER_AUTH_MICROSOFT_CLIENT_ID, env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET, env.BETTER_AUTH_MICROSOFT_TENANT_ID ? {tenantId: env.BETTER_AUTH_MICROSOFT_TENANT_ID} : undefined);

	return Object.keys(providers).length > 0 ? providers : undefined;
}
