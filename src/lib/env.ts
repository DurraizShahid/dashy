const requiredPublicVars = [
  "NEXT_PUBLIC_HIVE_MIND_API_URL",
] as const;

type PublicEnv = Record<(typeof requiredPublicVars)[number], string>;

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

export function getPublicEnv(key: (typeof requiredPublicVars)[number]): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required env var: ${key}. Add it to .env.local`
    );
  }
  return value;
}

export function isHiveMindEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_HIVE_MIND_API_URL;
}
