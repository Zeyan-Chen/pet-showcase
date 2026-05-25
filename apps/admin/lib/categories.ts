import type {
  CategoryInput,
  CategoryRecord,
  CategoryTreeRecord
} from "@pet-showcase/shared";
import { Types } from "mongoose";
import { CategoryModel } from "../models/category";
import { ProductModel } from "../models/product";
import { connectToDatabase } from "./db";

type RawCategory = {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  parentCategoryId?: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class CategoryNameConflictError extends Error {
  constructor() {
    super("CATEGORY_NAME_CONFLICT");
    this.name = "CategoryNameConflictError";
  }
}

export class InvalidCategoryParentError extends Error {
  constructor(message = "INVALID_CATEGORY_PARENT") {
    super(message);
    this.name = "InvalidCategoryParentError";
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

async function resolveParentCategoryId(parentCategoryId: string | null | undefined) {
  if (!parentCategoryId) {
    return null;
  }

  if (!Types.ObjectId.isValid(parentCategoryId)) {
    throw new InvalidCategoryParentError("PARENT_CATEGORY_NOT_FOUND");
  }

  const parentCategory = await CategoryModel.findById(parentCategoryId).lean<RawCategory | null>();

  if (!parentCategory) {
    throw new InvalidCategoryParentError("PARENT_CATEGORY_NOT_FOUND");
  }

  if (parentCategory.parentCategoryId) {
    throw new InvalidCategoryParentError("CATEGORY_DEPTH_EXCEEDED");
  }

  return parentCategory._id;
}

export function serializeCategory(category: RawCategory): CategoryRecord {
  return {
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    parentCategoryId: category.parentCategoryId ? category.parentCategoryId.toString() : null,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  };
}

export function buildCategoryTree(categories: CategoryRecord[]): CategoryTreeRecord[] {
  const rootCategories = categories
    .filter((category) => category.parentCategoryId === null)
    .sort((left, right) => left.name.localeCompare(right.name));

  return rootCategories.map((rootCategory) => ({
    ...rootCategory,
    children: categories
      .filter((category) => category.parentCategoryId === rootCategory._id)
      .sort((left, right) => left.name.localeCompare(right.name))
  }));
}

export async function listCategories() {
  await connectToDatabase();
  const categories = await CategoryModel.find().sort({ name: 1 }).lean<RawCategory[]>();
  return categories.map(serializeCategory);
}

export async function listCategoryTree() {
  const categories = await listCategories();
  return buildCategoryTree(categories);
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
  const parentCategoryId = await resolveParentCategoryId(input.parentCategoryId);
  const category = await CategoryModel.create({
    name,
    slug,
    parentCategoryId
  });
  return serializeCategory(category.toObject());
}

export async function updateCategory(id: string, input: CategoryInput) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  const existingCategory = await CategoryModel.findById(id).lean<RawCategory | null>();

  if (!existingCategory) {
    return null;
  }

  const name = await assertCategoryNameAvailable(input.name, id);
  const slug = await resolveUniqueCategorySlug(name, id);
  const parentCategoryId = await resolveParentCategoryId(input.parentCategoryId);

  if (parentCategoryId && parentCategoryId.toString() === id) {
    throw new InvalidCategoryParentError("CATEGORY_CANNOT_PARENT_ITSELF");
  }

  if (parentCategoryId && !existingCategory.parentCategoryId) {
    const childCount = await CategoryModel.countDocuments({ parentCategoryId: id });

    if (childCount > 0) {
      throw new InvalidCategoryParentError("CATEGORY_HAS_CHILDREN");
    }
  }

  const category = await CategoryModel.findByIdAndUpdate(
    id,
    {
      name,
      slug,
      parentCategoryId
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

  const childCount = await CategoryModel.countDocuments({ parentCategoryId: id });

  if (childCount > 0) {
    return { ok: false as const, reason: "category-has-children" as const };
  }

  const linkedProducts = await ProductModel.countDocuments({
    $or: [{ categoryId: id }, { mainCategoryId: id }, { childCategoryId: id }]
  });

  if (linkedProducts > 0) {
    return { ok: false as const, reason: "category-in-use" as const };
  }

  const category = await CategoryModel.findByIdAndDelete(id);
  return category
    ? { ok: true as const }
    : { ok: false as const, reason: "not-found" as const };
}
