import { NextResponse } from "next/server";
import { announcementInputSchema } from "@pet-showcase/shared";
import { requireAdmin } from "../../../lib/auth";
import {
  createAnnouncement,
  listActiveAnnouncements,
  listAnnouncements
} from "../../../lib/announcements";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "true";
  const announcements = activeOnly ? await listActiveAnnouncements() : await listAnnouncements();
  return NextResponse.json(announcements);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "請先登入後台。" }, { status: 401 });
  }

  const input = announcementInputSchema.parse(await request.json());
  const announcement = await createAnnouncement(input);
  return NextResponse.json(announcement, { status: 201 });
}
