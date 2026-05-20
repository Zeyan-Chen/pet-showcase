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

export function getAdminApiBaseUrl() {
  return getAdminApiBaseUrlCandidates()[0];
}

export async function fetchFromAdmin(path: string) {
  const candidates = getAdminApiBaseUrlCandidates();
  let lastError: unknown;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        cache: "no-store"
      });

      if (response.ok) {
        return response;
      }

      lastError = new Error(`Admin API responded with ${response.status} from ${baseUrl}${path}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to reach admin API.");
}

export function getAppBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${trimTrailingSlash(process.env.VERCEL_URL)}`;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_ENV === "production") {
    return `https://${trimTrailingSlash(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }

  return trimTrailingSlash(process.env.APP_BASE_URL ?? "http://127.0.0.1:3000");
}
