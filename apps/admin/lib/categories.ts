import type { CategoryInput, CategoryRecord } from "@pet-showcase/shared";
import { Types } from "mongoose";
import { CategoryModel } from "../models/category";
import { ProductModel } from "../models/product";
import { connectToDatabase } from "./db";

type RawCategory = {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export class CategoryNameConflictError extends Error {
  constructor() {
    super("CATEGORY_NAME_CONFLICT");
    this.name = "CategoryNameConflictError";
  }
}

export function normalizeCategoryName(name: string) {
  return name.normalize("NFKC").trim();
}

export function slugifyCategoryName(name: string) {
  const normalizedName = normalizeCategoryName(name).toLowerCase();
  const slug = normalizedName
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `category-${Date.now().toString(36)}`;
}

async function resolveUniqueCategorySlug(name: string, excludeId?: string) {
  const baseSlug = slugifyCategoryName(name);
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existingCategory = await CategoryModel.findOne({ slug }).select("_id").lean<{
      _id: Types.ObjectId | string;
    } | null>();

    if (!existingCategory || existingCategory._id.toString() === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function assertCategoryNameAvailable(name: string, excludeId?: string) {
  const normalizedName = normalizeCategoryName(name);
  const existingCategory = await CategoryModel.findOne({ name: normalizedName }).select("_id").lean<{
    _id: Types.ObjectId | string;
  } | null>();

  if (existingCategory && existingCategory._id.toString() !== excludeId) {
    throw new CategoryNameConflictError();
  }

  return normalizedName;
}

export function serializeCategory(category: RawCategory): CategoryRecord {
  return {
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  };
}

export async function listCategories() {
  await connectToDatabase();
  const categories = await CategoryModel.find().sort({ name: 1 }).lean<RawCategory[]>();
  return categories.map(serializeCategory);
}

export async function getCategoryById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  const category = await CategoryModel.findById(id).lean<RawCategory | null>();
  return category ? serializeCategory(category) : null;
}

export async function createCategory(input: CategoryInput) {
  await connectToDatabase();
  const name = await assertCategoryNameAvailable(input.name);
  const slug = await resolveUniqueCategorySlug(name);
  const category = await CategoryModel.create({
    name,
    slug
  });
  return serializeCategory(category.toObject());
}

export async function updateCategory(id: string, input: CategoryInput) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  const name = await assertCategoryNameAvailable(input.name, id);
  const slug = await resolveUniqueCategorySlug(name, id);
  const category = await CategoryModel.findByIdAndUpdate(
    id,
    {
      name,
      slug
    },
    {
      new: true
    }
  ).lean<RawCategory | null>();

  return category ? serializeCategory(category) : null;
}

export async function deleteCategory(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return { ok: false as const, reason: "invalid-id" as const };
  }

  await connectToDatabase();
  const linkedProducts = await ProductModel.countDocuments({ categoryId: id });

  if (linkedProducts > 0) {
    return { ok: false as const, reason: "category-in-use" as const };
  }

  const category = await CategoryModel.findByIdAndDelete(id);
  return category
    ? { ok: true as const }
    : { ok: false as const, reason: "not-found" as const };
}
