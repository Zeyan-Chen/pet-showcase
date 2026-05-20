function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getAdminApiBaseUrl() {
  return trimTrailingSlash(
    process.env.ADMIN_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://127.0.0.1:3001"
  );
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
