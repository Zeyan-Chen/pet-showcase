import { z } from "zod";

export const announcementInputSchema = z.object({
  message: z.string().min(1).max(160),
  isActive: z.boolean()
});

export type AnnouncementInput = z.infer<typeof announcementInputSchema>;

export type AnnouncementRecord = AnnouncementInput & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
