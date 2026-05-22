import { z } from "zod";

export const siteSettingsInputSchema = z.object({
  logoImageUrl: z.string().url(),
  logoPublicId: z.string().trim().min(1),
  logoAlt: z.string().trim().min(1).max(120)
});

export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;

export type SiteSettingsRecord = SiteSettingsInput & {
  _id: string;
  updatedAt: string;
};
