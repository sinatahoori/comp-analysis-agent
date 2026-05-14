export function getOptionalEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v : undefined;
}

/** Base URL for server-side links (e.g. Slack). Uses VERCEL_URL on Vercel when unset. */
export function getAppBaseUrl(): string | undefined {
  const explicit =
    getOptionalEnv("APP_BASE_URL") ?? getOptionalEnv("NEXT_PUBLIC_APP_URL");
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercel = getOptionalEnv("VERCEL_URL");
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  return undefined;
}
