import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export function buildCloudinaryFolder() {
  return "pet-showcase/products";
}

export async function uploadImage(buffer: Buffer, filename: string) {
  const ext = filename.split(".").pop() || "jpg";
  const dataUri = `data:image/${ext};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: buildCloudinaryFolder(),
    public_id: filename.replace(/\.[^/.]+$/, "")
  });

  return result.secure_url;
}
