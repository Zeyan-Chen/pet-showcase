import { NextResponse } from "next/server";
import { categoryInputSchema } from "@pet-showcase/shared";
import { requireAdmin } from "../../../lib/auth";
import {
  CategoryNameConflictError,
  InvalidCategoryParentError,
  createCategory,
  listCategories,
  listCategoryTree
} from "../../../lib/categories";

function isDuplicateKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categories =
    searchParams.get("view") === "flat" ? await listCategories() : await listCategoryTree();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權的請求。" }, { status: 401 });
  }

  try {
    const input = categoryInputSchema.parse(await request.json());
    const category = await createCategory(input);
    return NextResponse.json(category, { status: 201 });
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
