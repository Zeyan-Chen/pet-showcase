import { z } from "zod";

export const productStatusSchema = z.enum(["draft", "published"]);

export const productInputSchema = z.object({
  name: z.string().min(1).max(80),
  price: z.coerce.number().min(0),
  imageUrl: z.string().url(),
  description: z.string().min(1).max(2000),
  status: productStatusSchema
});

export type ProductInput = z.infer<typeof productInputSchema>;

export type ProductRecord = ProductInput & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
