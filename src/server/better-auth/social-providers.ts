import type { BetterAuthOptions } from "better-auth";

export type OAuthEnv = {
  BETTER_AUTH_GITHUB_CLIENT_ID?: string;
  BETTER_AUTH_GITHUB_CLIENT_SECRET?: string;
  BETTER_AUTH_GOOGLE_CLIENT_ID?: string;
  BETTER_AUTH_GOOGLE_CLIENT_SECRET?: string;
};

export function buildSocialProviders(
  env: OAuthEnv,
): BetterAuthOptions["socialProviders"] {
  const socialProviders: NonNullable<BetterAuthOptions["socialProviders"]> = {};

  if (
    env.BETTER_AUTH_GITHUB_CLIENT_ID &&
    env.BETTER_AUTH_GITHUB_CLIENT_SECRET
  ) {
    socialProviders.github = {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    };
  }

  if (
    env.BETTER_AUTH_GOOGLE_CLIENT_ID &&
    env.BETTER_AUTH_GOOGLE_CLIENT_SECRET
  ) {
    socialProviders.google = {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    };
  }

  return Object.keys(socialProviders).length > 0 ? socialProviders : undefined;
}
