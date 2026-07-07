/**
 * Environment variable validation and access.
 *
 * All env vars accessed through this module to ensure they are present
 * at runtime (client-side) or build-time (server-side).
 *
 * NEXT_PUBLIC_* vars are inlined at build time and available on the client.
 * Server-only vars are never exposed to the client bundle.
 */

const requiredPublicVars = [
  "NEXT_PUBLIC_HIVE_MIND_API_URL",
] as const;

type PublicEnv = Record<(typeof requiredPublicVars)[number], string>;

/**
 * Validates all required NEXT_PUBLIC_* vars are set.
 * Throws with a clear message listing which are missing.
 * Call this at module boundaries where these vars are needed.
 */
export function validatePublicEnv(): PublicEnv {
  const missing: string[] = [];

  for (const key of requiredPublicVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join("\n  ")}\n\n` +
        "Add them to your .env.local file. See .env.example for reference."
    );
  }

  return requiredPublicVars.reduce(
    (acc, key) => {
      acc[key] = process.env[key]!;
      return acc;
    },
    {} as Record<string, string>
  ) as PublicEnv;
}

/**
 * Safe accessor — returns the value or throws if not set.
 * Use this instead of `process.env.X` directly for required vars.
 */
export function getPublicEnv(key: (typeof requiredPublicVars)[number]): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required env var: ${key}. Add it to .env.local`
    );
  }
  return value;
}

/**
 * Whether Hive Mind features are enabled (URL is set).
 * Use this for conditionally rendering UI sections.
 */
export function isHiveMindEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_HIVE_MIND_API_URL;
}

/**
 * Returns the Hive Mind API key, if configured.
 * Used to authenticate API client for protected endpoints.
 */
export function getHiveMindApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_HIVE_MIND_API_KEY || undefined;
}
