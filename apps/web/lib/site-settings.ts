export type SiteSettingsRecord = {
  _id: string;
  logoAlt: string;
  logoImageUrl: string;
  logoPublicId: string;
  updatedAt: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getAdminApiBaseUrlCandidates() {
  const values = [
    process.env.ADMIN_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "https://pet-showcase-admin.vercel.app",
    "http://127.0.0.1:3001"
  ].filter((value): value is string => Boolean(value && value.trim()));

  return [...new Set(values.map((value) => trimTrailingSlash(value)))];
}

function isSiteSettingsRecord(value: unknown): value is SiteSettingsRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate._id === "string" &&
    typeof candidate.logoAlt === "string" &&
    typeof candidate.logoImageUrl === "string" &&
    typeof candidate.logoPublicId === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

export async function getSiteSettings(): Promise<SiteSettingsRecord | null> {
  for (const baseUrl of getAdminApiBaseUrlCandidates()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(`${baseUrl}/api/settings`, {
        next: { revalidate: 30 },
        signal: controller.signal
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as unknown;
      return isSiteSettingsRecord(payload) ? payload : null;
    } catch {
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}
