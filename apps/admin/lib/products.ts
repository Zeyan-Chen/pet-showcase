import type { ProductInput, ProductRecord } from "@pet-showcase/shared";
import { Types } from "mongoose";
import { ProductModel } from "../models/product";
import { connectToDatabase } from "./db";

type RawProduct = {
  _id: Types.ObjectId | string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
};

export function serializeProduct(product: RawProduct): ProductRecord {
  return {
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    description: product.description,
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}

export async function listProducts() {
  await connectToDatabase();
  const products = await ProductModel.find().sort({ createdAt: -1 }).lean<RawProduct[]>();
  return products.map(serializeProduct);
}

export async function listPublishedProducts() {
  await connectToDatabase();
  const products = await ProductModel.find({ status: "published" })
    .sort({ createdAt: -1 })
    .lean<RawProduct[]>();
  return products.map(serializeProduct);
}

export async function getProductById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  const product = await ProductModel.findById(id).lean<RawProduct | null>();
  return product ? serializeProduct(product) : null;
}

export async function getPublishedProductById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  const product = await ProductModel.findOne({ _id: id, status: "published" }).lean<RawProduct | null>();
  return product ? serializeProduct(product) : null;
}

export async function createProduct(input: ProductInput) {
  await connectToDatabase();
  const product = await ProductModel.create(input);
  return serializeProduct(product.toObject());
}

export async function updateProduct(id: string, input: ProductInput) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  const product = await ProductModel.findByIdAndUpdate(id, input, {
    new: true
  }).lean<RawProduct | null>();
  return product ? serializeProduct(product) : null;
}

export async function deleteProduct(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return false;
  }

  await connectToDatabase();
  const result = await ProductModel.findByIdAndDelete(id);
  return Boolean(result);
}
