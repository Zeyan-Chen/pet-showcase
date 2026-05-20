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
    return NextResponse.json({ message: "未授權" }, { status: 401 });
  }

  try {
    const input = productInputSchema.parse(await request.json());
    const product = await createProduct(input);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return NextResponse.json({ message: "找不到指定分類" }, { status: 400 });
    }

    throw error;
  }
}
