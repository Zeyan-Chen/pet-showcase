import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(1).max(80),
  parentCategoryId: z.string().min(1).nullable().optional().default(null)
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export type CategoryRecord = {
  _id: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryTreeRecord = CategoryRecord & {
  children: CategoryRecord[];
};
