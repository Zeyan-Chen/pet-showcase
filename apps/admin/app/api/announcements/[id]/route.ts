import { NextResponse } from "next/server";
import { announcementInputSchema } from "@pet-showcase/shared";
import { requireAdmin } from "../../../../lib/auth";
import { deleteAnnouncement, updateAnnouncement } from "../../../../lib/announcements";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "請先登入後台。" }, { status: 401 });
  }

  const { id } = await context.params;
  const input = announcementInputSchema.parse(await request.json());
  const announcement = await updateAnnouncement(id, input);

  return announcement
    ? NextResponse.json(announcement)
    : NextResponse.json({ message: "找不到這筆公告。" }, { status: 404 });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "請先登入後台。" }, { status: 401 });
  }

  const { id } = await context.params;
  const ok = await deleteAnnouncement(id);

  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ message: "找不到這筆公告。" }, { status: 404 });
}
