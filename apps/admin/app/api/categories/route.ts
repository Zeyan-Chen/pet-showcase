import { NextResponse } from "next/server";
import { categoryInputSchema } from "@pet-showcase/shared";
import { requireAdmin } from "../../../lib/auth";
import { createCategory, listCategories } from "../../../lib/categories";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "未授權" }, { status: 401 });
  }

  const input = categoryInputSchema.parse(await request.json());
  const category = await createCategory(input);
  return NextResponse.json(category, { status: 201 });
}
