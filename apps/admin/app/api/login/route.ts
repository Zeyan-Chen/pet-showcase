import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, createSessionValue } from "../../../lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (
    body.email !== process.env.ADMIN_EMAIL ||
    body.password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionValue(body.email as string), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return NextResponse.json({ ok: true });
}
