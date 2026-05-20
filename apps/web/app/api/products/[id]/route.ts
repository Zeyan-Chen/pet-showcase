import { NextResponse } from "next/server";
import { getAdminApiBaseUrl } from "../../../../lib/api";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const response = await fetch(`${getAdminApiBaseUrl()}/api/products/${id}`, {
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
    return NextResponse.json({ message: "無法讀取商品資料。" }, { status: 502 });
  }
}
