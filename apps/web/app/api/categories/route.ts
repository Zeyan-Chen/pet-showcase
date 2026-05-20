import { NextResponse } from "next/server";
import { getAdminApiBaseUrl } from "../../../lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${getAdminApiBaseUrl()}/api/categories`, {
      cache: "no-store"
    });
    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json; charset=utf-8"
      }
    });
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
