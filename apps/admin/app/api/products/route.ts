import { NextRequest, NextResponse } from "next/server";
import { productInputSchema } from "@pet-showcase/shared";
import { createProduct, listProducts, listPublishedProducts } from "../../../lib/products";
import { requireAdmin } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const products = status === "published" ? await listPublishedProducts() : await listProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const input = productInputSchema.parse(json);
  const product = await createProduct(input);
  return NextResponse.json(product, { status: 201 });
}
