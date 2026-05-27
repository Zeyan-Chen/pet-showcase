import type { ProductInput, ProductRecord } from "@pet-showcase/shared";
import { Types } from "mongoose";
import { CategoryModel } from "../models/category";
import { ProductModel } from "../models/product";
import { connectToDatabase } from "./db";

type RawCategory = {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  parentCategoryId?: Types.ObjectId | string | null;
  includeInAllListing?: boolean;
};

type RawProduct = {
  _id: Types.ObjectId | string;
  name: string;
  price: number;
  imageUrl: string;
  imageUrls?: string[];
  description: string;
  status: "draft" | "published";
  isSoldOut?: boolean;
  categoryId?: Types.ObjectId | string | RawCategory | null;
  mainCategoryId?: Types.ObjectId | string | RawCategory | null;
  childCategoryId?: Types.ObjectId | string | RawCategory | null;
  mainCategory?: RawCategory;
  childCategory?: RawCategory | null;
  createdAt: Date;
  updatedAt: Date;
};

function isRawCategory(
  value:
    | RawProduct["categoryId"]
    | RawProduct["mainCategoryId"]
    | RawProduct["childCategoryId"]
    | RawProduct["mainCategory"]
    | RawProduct["childCategory"]
): value is RawCategory {
  return value !== null && value !== undefined && typeof value === "object" && "name" in value && "slug" in value;
}

function getMainCategory(product: RawProduct) {
  if (product.mainCategory) {
    return product.mainCategory;
  }

  if (isRawCategory(product.mainCategoryId)) {
    return product.mainCategoryId;
  }

  if (isRawCategory(product.categoryId)) {
    return product.categoryId;
  }

  throw new Error("PRODUCT_MAIN_CATEGORY_NOT_POPULATED");
}

function getChildCategory(product: RawProduct) {
  if (product.childCategory) {
    return product.childCategory;
  }

  if (isRawCategory(product.childCategoryId)) {
    return product.childCategoryId;
  }

  return null;
}

async function getSerializedProductById(id: string) {
  const product = await ProductModel.findById(id)
    .populate("categoryId", "name slug parentCategoryId includeInAllListing")
    .populate("mainCategoryId", "name slug parentCategoryId includeInAllListing")
    .populate("childCategoryId", "name slug parentCategoryId includeInAllListing")
    .lean<RawProduct | null>();

  return product ? serializeProduct(product) : null;
}

async function assertCategorySelection(mainCategoryId: string, childCategoryId?: string | null) {
  if (!Types.ObjectId.isValid(mainCategoryId)) {
    throw new Error("MAIN_CATEGORY_NOT_FOUND");
  }

  const mainCategory = await CategoryModel.findById(mainCategoryId).lean<RawCategory | null>();

  if (!mainCategory) {
    throw new Error("MAIN_CATEGORY_NOT_FOUND");
  }

  if (mainCategory.parentCategoryId) {
    throw new Error("MAIN_CATEGORY_MUST_BE_TOP_LEVEL");
  }

  if (!childCategoryId) {
    return {
      mainCategoryId: mainCategory._id,
      childCategoryId: null as Types.ObjectId | null
    };
  }

  if (!Types.ObjectId.isValid(childCategoryId)) {
    throw new Error("CHILD_CATEGORY_NOT_FOUND");
  }

  const childCategory = await CategoryModel.findById(childCategoryId).lean<RawCategory | null>();

  if (!childCategory) {
    throw new Error("CHILD_CATEGORY_NOT_FOUND");
  }

  if (!childCategory.parentCategoryId) {
    throw new Error("CHILD_CATEGORY_INVALID");
  }

  if (childCategory.parentCategoryId.toString() !== mainCategory._id.toString()) {
    throw new Error("CHILD_CATEGORY_PARENT_MISMATCH");
  }

  return {
    mainCategoryId: mainCategory._id,
    childCategoryId: new Types.ObjectId(childCategory._id.toString())
  };
}

export function serializeProduct(product: RawProduct): ProductRecord {
  const effectiveImageUrls =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const mainCategory = getMainCategory(product);
  const childCategory = getChildCategory(product);
  const displayCategory = childCategory ?? mainCategory;
  const mainCategoryId = isRawCategory(product.mainCategoryId)
    ? product.mainCategoryId._id
    : product.mainCategoryId ?? product.categoryId;
  const childCategoryId = isRawCategory(product.childCategoryId)
    ? product.childCategoryId._id
    : product.childCategoryId ?? null;

  return {
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    imageUrl: effectiveImageUrls[0] ?? product.imageUrl,
    imageUrls: effectiveImageUrls,
    description: product.description,
    status: product.status,
    isSoldOut: product.isSoldOut ?? false,
    mainCategoryId: mainCategoryId?.toString() ?? "",
    childCategoryId: childCategoryId ? childCategoryId.toString() : null,
    mainCategory: {
      _id: mainCategory._id.toString(),
      name: mainCategory.name,
      slug: mainCategory.slug,
      parentCategoryId: mainCategory.parentCategoryId ? mainCategory.parentCategoryId.toString() : null,
      includeInAllListing: mainCategory.includeInAllListing ?? true
    },
    childCategory: childCategory
      ? {
          _id: childCategory._id.toString(),
          name: childCategory.name,
          slug: childCategory.slug,
          parentCategoryId: childCategory.parentCategoryId
            ? childCategory.parentCategoryId.toString()
            : null,
          includeInAllListing: true
        }
      : null,
    category: {
      _id: displayCategory._id.toString(),
      name: displayCategory.name,
      slug: displayCategory.slug,
      parentCategoryId: displayCategory.parentCategoryId
        ? displayCategory.parentCategoryId.toString()
        : null,
      includeInAllListing: displayCategory.includeInAllListing ?? true
    },
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}

export async function listProducts() {
  await connectToDatabase();
  const products = await ProductModel.find()
    .sort({ createdAt: -1 })
    .populate("categoryId", "name slug parentCategoryId includeInAllListing")
    .populate("mainCategoryId", "name slug parentCategoryId includeInAllListing")
    .populate("childCategoryId", "name slug parentCategoryId includeInAllListing")
    .lean<RawProduct[]>();
  return products.map(serializeProduct);
}

export async function listPublishedProducts() {
  await connectToDatabase();
  const products = await ProductModel.find({ status: "published" })
    .sort({ createdAt: -1 })
    .populate("categoryId", "name slug parentCategoryId includeInAllListing")
    .populate("mainCategoryId", "name slug parentCategoryId includeInAllListing")
    .populate("childCategoryId", "name slug parentCategoryId includeInAllListing")
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
    .populate("categoryId", "name slug parentCategoryId includeInAllListing")
    .populate("mainCategoryId", "name slug parentCategoryId includeInAllListing")
    .populate("childCategoryId", "name slug parentCategoryId includeInAllListing")
    .lean<RawProduct | null>();
  return product ? serializeProduct(product) : null;
}

export async function createProduct(input: ProductInput) {
  await connectToDatabase();
  const effectiveImageUrls =
    input.imageUrls && input.imageUrls.length > 0
      ? input.imageUrls
      : input.imageUrl
        ? [input.imageUrl]
        : [];
  const imageUrl = effectiveImageUrls[0] ?? input.imageUrl;
  const categorySelection = await assertCategorySelection(
    input.mainCategoryId,
    input.childCategoryId
  );
  const product = await ProductModel.create({
    ...input,
    imageUrl,
    imageUrls: effectiveImageUrls,
    categoryId: categorySelection.mainCategoryId,
    mainCategoryId: categorySelection.mainCategoryId,
    childCategoryId: categorySelection.childCategoryId
  });
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
  const effectiveImageUrls =
    input.imageUrls && input.imageUrls.length > 0
      ? input.imageUrls
      : input.imageUrl
        ? [input.imageUrl]
        : [];
  const imageUrl = effectiveImageUrls[0] ?? input.imageUrl;
  const categorySelection = await assertCategorySelection(
    input.mainCategoryId,
    input.childCategoryId
  );
  const product = await ProductModel.findByIdAndUpdate(
    id,
    {
      ...input,
      imageUrl,
      imageUrls: effectiveImageUrls,
      categoryId: categorySelection.mainCategoryId,
      mainCategoryId: categorySelection.mainCategoryId,
      childCategoryId: categorySelection.childCategoryId
    },
    {
      new: true
    }
  ).lean<{ _id: Types.ObjectId | string } | null>();

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
