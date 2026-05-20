import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(1).max(80)
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export type CategoryRecord = CategoryInput & {
  _id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};
