import { NextResponse } from "next/server";
import { categoryInputSchema } from "@pet-showcase/shared";
import { requireAdmin } from "../../../../lib/auth";
import {
  CategoryNameConflictError,
  InvalidCategoryParentError,
  deleteCategory,
  updateCategory
} from "../../../../lib/categories";

function isDuplicateKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權的請求。" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const input = categoryInputSchema.parse(await request.json());
    const category = await updateCategory(id, input);

    return category
      ? NextResponse.json(category)
      : NextResponse.json({ message: "找不到指定的分類。" }, { status: 404 });
  } catch (error) {
    if (error instanceof InvalidCategoryParentError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof CategoryNameConflictError || isDuplicateKeyError(error)) {
      return NextResponse.json(
        { message: "已有相同名稱的分類，請換一個名稱。" },
        { status: 409 }
      );
    }

    throw error;
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權的請求。" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await deleteCategory(id);

  if (!result.ok && result.reason === "category-has-children") {
    return NextResponse.json(
      { message: "請先刪除這個主分類底下的細項，再刪除主分類。" },
      { status: 409 }
    );
  }

  if (!result.ok && result.reason === "category-in-use") {
    return NextResponse.json(
      { message: "這個分類仍被商品使用中，請先調整商品後再刪除。" },
      { status: 409 }
    );
  }

  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ message: "找不到指定的分類。" }, { status: 404 });
}
