import { NextResponse } from "next/server";
import { siteSettingsInputSchema } from "@pet-showcase/shared";
import { requireAdmin } from "../../../lib/auth";
import { getSiteSettings, upsertSiteSettings } from "../../../lib/site-settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "需要管理員權限。" }, { status: 401 });
  }

  const input = siteSettingsInputSchema.parse(await request.json());
  const settings = await upsertSiteSettings(input);
  return NextResponse.json(settings);
}
