import { NextRequest, NextResponse } from "next/server";
import { productInputSchema } from "@pet-showcase/shared";
import { createProduct, listProducts, listPublishedProducts } from "../../../lib/products";
import { requireAdmin } from "../../../lib/auth";

function isCategoryError(error: unknown) {
  return (
    error instanceof Error &&
    [
      "MAIN_CATEGORY_NOT_FOUND",
      "MAIN_CATEGORY_MUST_BE_TOP_LEVEL",
      "CHILD_CATEGORY_NOT_FOUND",
      "CHILD_CATEGORY_INVALID",
      "CHILD_CATEGORY_PARENT_MISMATCH"
    ].includes(error.message)
  );
}

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const products = status === "published" ? await listPublishedProducts() : await listProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權的請求。" }, { status: 401 });
  }

  try {
    const input = productInputSchema.parse(await request.json());
    const product = await createProduct(input);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (isCategoryError(error)) {
      return NextResponse.json({ message: "分類設定無效，請重新選擇主分類與細項。" }, { status: 400 });
    }

    throw error;
  }
}
