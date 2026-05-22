import { Schema, model, models } from "mongoose";

const siteSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "site-settings" },
    logoAlt: { type: String, required: true, trim: true },
    logoImageUrl: { type: String, required: true, trim: true },
    logoPublicId: { type: String, required: true, trim: true }
  },
  {
    timestamps: { createdAt: false, updatedAt: true }
  }
);

export const SiteSettingsModel =
  models.SiteSettings ?? model("SiteSettings", siteSettingsSchema);
