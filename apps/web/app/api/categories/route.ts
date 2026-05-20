import { NextResponse } from "next/server";
import { fetchFromAdmin } from "../../../lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetchFromAdmin("/api/categories");
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
