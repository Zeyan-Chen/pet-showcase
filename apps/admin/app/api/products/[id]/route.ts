import { NextRequest, NextResponse } from "next/server";
import { productInputSchema } from "@pet-showcase/shared";
import { deleteProduct, getPublishedProductById, updateProduct } from "../../../../lib/products";
import { requireAdmin } from "../../../../lib/auth";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await getPublishedProductById(id);

  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const formData = await request.formData();
  const method = String(formData.get("_method") ?? "").toLowerCase();

  if (method !== "delete") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteProduct(id);
  return NextResponse.redirect(new URL("/products", request.url));
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const input = productInputSchema.parse(json);
  const { id } = await context.params;
  const product = await updateProduct(id, input);

  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteProduct(id);
  return new NextResponse(null, { status: deleted ? 204 : 404 });
}
