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

export function slugifyCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  const category = await CategoryModel.create({
    name: input.name,
    slug: slugifyCategoryName(input.name)
  });
  return serializeCategory(category.toObject());
}

export async function updateCategory(id: string, input: CategoryInput) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  const category = await CategoryModel.findByIdAndUpdate(
    id,
    {
      name: input.name,
      slug: slugifyCategoryName(input.name)
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
