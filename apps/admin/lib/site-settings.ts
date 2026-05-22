import type { SiteSettingsInput, SiteSettingsRecord } from "@pet-showcase/shared";
import { Types } from "mongoose";
import { SiteSettingsModel } from "../models/site-settings";
import { connectToDatabase } from "./db";

type RawSiteSettings = {
  _id: Types.ObjectId | string;
  logoAlt: string;
  logoImageUrl: string;
  logoPublicId: string;
  updatedAt: Date;
};

const CLOUDINARY_UPLOAD_SEGMENT = "/upload/";

export function serializeSiteSettings(settings: RawSiteSettings): SiteSettingsRecord {
  return {
    _id: settings._id.toString(),
    logoAlt: settings.logoAlt,
    logoImageUrl: settings.logoImageUrl,
    logoPublicId: settings.logoPublicId,
    updatedAt: settings.updatedAt.toISOString()
  };
}

export function extractCloudinaryPublicId(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const uploadIndex = parsedUrl.pathname.indexOf(CLOUDINARY_UPLOAD_SEGMENT);

    if (uploadIndex === -1) {
      return "";
    }

    const afterUpload = parsedUrl.pathname.slice(uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length);
    const segments = afterUpload.split("/").filter(Boolean);

    if (segments.length === 0) {
      return "";
    }

    const pathSegments =
      segments[0]?.startsWith("v") && /^\d+$/.test(segments[0].slice(1)) ? segments.slice(1) : segments;

    if (pathSegments.length === 0) {
      return "";
    }

    const lastSegment = pathSegments[pathSegments.length - 1];
    pathSegments[pathSegments.length - 1] = lastSegment.replace(/\.[^/.]+$/, "");

    return pathSegments.join("/");
  } catch {
    return "";
  }
}

export async function getSiteSettings() {
  await connectToDatabase();
  const settings = await SiteSettingsModel.findOne({ key: "site-settings" })
    .sort({ updatedAt: -1 })
    .lean<RawSiteSettings | null>();

  return settings ? serializeSiteSettings(settings) : null;
}

export async function upsertSiteSettings(input: SiteSettingsInput) {
  await connectToDatabase();
  const settings = await SiteSettingsModel.findOneAndUpdate(
    { key: "site-settings" },
    {
      key: "site-settings",
      logoAlt: input.logoAlt.trim(),
      logoImageUrl: input.logoImageUrl.trim(),
      logoPublicId: input.logoPublicId.trim()
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).lean<RawSiteSettings | null>();

  if (!settings) {
    throw new Error("SITE_SETTINGS_UPSERT_FAILED");
  }

  return serializeSiteSettings(settings);
}
