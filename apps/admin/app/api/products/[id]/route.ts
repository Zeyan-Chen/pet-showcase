import { NextRequest, NextResponse } from "next/server";
import { productInputSchema } from "@pet-showcase/shared";
import { deleteProduct, getPublishedProductById, updateProduct } from "../../../../lib/products";
import { requireAdmin } from "../../../../lib/auth";

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

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await getPublishedProductById(id);

  if (!product) {
    return NextResponse.json({ message: "找不到商品。" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const formData = await request.formData();
  const method = String(formData.get("_method") ?? "").toLowerCase();

  if (method !== "delete") {
    return NextResponse.json({ message: "不支援的請求方法。" }, { status: 405 });
  }

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權的請求。" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteProduct(id);
  return NextResponse.redirect(new URL("/products", request.url));
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權的請求。" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const input = productInputSchema.parse(await request.json());
    const product = await updateProduct(id, input);

    if (!product) {
      return NextResponse.json({ message: "找不到商品。" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    if (isCategoryError(error)) {
      return NextResponse.json({ message: "分類設定無效，請重新選擇主分類與細項。" }, { status: 400 });
    }

    throw error;
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權的請求。" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteProduct(id);
  return new NextResponse(null, { status: deleted ? 204 : 404 });
}
