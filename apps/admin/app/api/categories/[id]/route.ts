import { NextResponse } from "next/server";
import { categoryInputSchema } from "@pet-showcase/shared";
import { requireAdmin } from "../../../../lib/auth";
import { deleteCategory, updateCategory } from "../../../../lib/categories";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權" }, { status: 401 });
  }

  const { id } = await context.params;
  const input = categoryInputSchema.parse(await request.json());
  const category = await updateCategory(id, input);

  return category
    ? NextResponse.json(category)
    : NextResponse.json({ message: "找不到分類" }, { status: 404 });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await deleteCategory(id);

  if (!result.ok && result.reason === "category-in-use") {
    return NextResponse.json(
      { message: "請先重新分配使用這個分類的商品，再刪除此分類。" },
      { status: 409 }
    );
  }

  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ message: "找不到分類" }, { status: 404 });
}
