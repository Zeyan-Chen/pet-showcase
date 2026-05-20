import { NextRequest, NextResponse } from "next/server";
import { productInputSchema } from "@pet-showcase/shared";
import { deleteProduct, getPublishedProductById, updateProduct } from "../../../../lib/products";
import { requireAdmin } from "../../../../lib/auth";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await getPublishedProductById(id);

  if (!product) {
    return NextResponse.json({ message: "找不到商品" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const formData = await request.formData();
  const method = String(formData.get("_method") ?? "").toLowerCase();

  if (method !== "delete") {
    return NextResponse.json({ message: "不支援的請求方法" }, { status: 405 });
  }

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteProduct(id);
  return NextResponse.redirect(new URL("/products", request.url));
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const input = productInputSchema.parse(await request.json());
    const product = await updateProduct(id, input);

    if (!product) {
      return NextResponse.json({ message: "找不到商品" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return NextResponse.json({ message: "找不到指定分類" }, { status: 400 });
    }

    throw error;
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteProduct(id);
  return new NextResponse(null, { status: deleted ? 204 : 404 });
}
