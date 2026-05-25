import { z } from "zod";
import type { CategoryRecord } from "./category";

export const productStatusSchema = z.enum(["draft", "published"]);

export const productInputSchema = z.object({
  name: z.string().min(1).max(80),
  price: z.coerce.number().min(0),
  imageUrl: z.string().url(),
  description: z.string().min(1).max(2000),
  status: productStatusSchema,
  mainCategoryId: z.string().min(1),
  childCategoryId: z.string().min(1).nullable().optional().default(null)
});

export type ProductInput = z.infer<typeof productInputSchema>;

export type ProductRecord = ProductInput & {
  _id: string;
  mainCategory: Pick<CategoryRecord, "_id" | "name" | "slug" | "parentCategoryId">;
  childCategory: Pick<CategoryRecord, "_id" | "name" | "slug" | "parentCategoryId"> | null;
  category: Pick<CategoryRecord, "_id" | "name" | "slug" | "parentCategoryId">;
  createdAt: string;
  updatedAt: string;
};
