import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth";
import { uploadImage } from "../../../lib/cloudinary";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const imageUrl = await uploadImage(Buffer.from(arrayBuffer), file.name);

  return NextResponse.json({ imageUrl }, { status: 201 });
}
