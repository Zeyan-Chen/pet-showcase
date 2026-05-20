import type { ProductInput, ProductRecord } from "@pet-showcase/shared";
import { Types } from "mongoose";
import { CategoryModel } from "../models/category";
import { ProductModel } from "../models/product";
import { connectToDatabase } from "./db";

type RawCategory = {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
};

type RawProduct = {
  _id: Types.ObjectId | string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  status: "draft" | "published";
  categoryId: Types.ObjectId | string | RawCategory;
  category?: RawCategory;
  createdAt: Date;
  updatedAt: Date;
};

function isRawCategory(value: RawProduct["categoryId"] | RawProduct["category"]): value is RawCategory {
  return Boolean(value) && typeof value === "object" && "name" in value && "slug" in value;
}

function getProductCategory(product: RawProduct) {
  if (product.category) {
    return product.category;
  }

  if (isRawCategory(product.categoryId)) {
    return product.categoryId;
  }

  throw new Error("PRODUCT_CATEGORY_NOT_POPULATED");
}

async function getSerializedProductById(id: string) {
  const product = await ProductModel.findById(id)
    .populate("categoryId", "name slug")
    .lean<RawProduct | null>();

  return product ? serializeProduct(product) : null;
}

async function assertCategoryExists(categoryId: string) {
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const category = await CategoryModel.findById(categoryId).select("_id").lean();

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
}

export function serializeProduct(product: RawProduct): ProductRecord {
  const category = getProductCategory(product);
  const categoryId = isRawCategory(product.categoryId) ? product.categoryId._id : product.categoryId;

  return {
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    description: product.description,
    status: product.status,
    categoryId: categoryId.toString(),
    category: {
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug
    },
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}

export async function listProducts() {
  await connectToDatabase();
  const products = await ProductModel.find()
    .sort({ createdAt: -1 })
    .populate("categoryId", "name slug")
    .lean<RawProduct[]>();
  return products.map(serializeProduct);
}

export async function listPublishedProducts() {
  await connectToDatabase();
  const products = await ProductModel.find({ status: "published" })
    .sort({ createdAt: -1 })
    .populate("categoryId", "name slug")
    .lean<RawProduct[]>();
  return products.map(serializeProduct);
}

export async function getProductById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  return getSerializedProductById(id);
}

export async function getPublishedProductById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  const product = await ProductModel.findOne({ _id: id, status: "published" })
    .populate("categoryId", "name slug")
    .lean<RawProduct | null>();
  return product ? serializeProduct(product) : null;
}

export async function createProduct(input: ProductInput) {
  await connectToDatabase();
  await assertCategoryExists(input.categoryId);
  const product = await ProductModel.create(input);
  const serializedProduct = await getSerializedProductById(product._id.toString());

  if (!serializedProduct) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return serializedProduct;
}

export async function updateProduct(id: string, input: ProductInput) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  await assertCategoryExists(input.categoryId);
  const product = await ProductModel.findByIdAndUpdate(id, input, {
    new: true
  }).lean<{ _id: Types.ObjectId | string } | null>();

  if (!product) {
    return null;
  }

  return getSerializedProductById(product._id.toString());
}

export async function deleteProduct(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return false;
  }

  await connectToDatabase();
  const result = await ProductModel.findByIdAndDelete(id);
  return Boolean(result);
}
