import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "pet-showcase-admin-session";

function getSecret() {
  if (!process.env.ADMIN_SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  return process.env.ADMIN_SESSION_SECRET;
}

function signPayload(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionValue(email: string) {
  const payload = Buffer.from(JSON.stringify({ email })).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

export function verifySessionValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return false;
  }

  const expected = signPayload(payload);
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function isAuthenticated() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySessionValue(token);
}

export async function requireAdmin() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    throw new Error("UNAUTHORIZED");
  }
}
