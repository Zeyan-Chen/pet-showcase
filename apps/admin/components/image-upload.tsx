"use client";

import { useState } from "react";

export function ImageUpload({
  values,
  onChange
}: {
  values: string[];
  onChange: (nextValues: string[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const nextUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("UPLOAD_FAILED");
        }

        const data = (await response.json()) as { imageUrl: string };
        nextUrls.push(data.imageUrl);
      }

      onChange([...values, ...nextUrls]);
    } catch {
      setError("圖片上傳失敗，請稍後再試。");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => uploadFiles(event.target.files)}
      />
      {isUploading ? <p className="text-sm text-stone-600">圖片上傳中...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {values.length > 0 ? (
        <div className="space-y-3">
          {values.map((imageUrl) => (
            <div
              key={imageUrl}
              className="space-y-2 rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-3"
            >
              <input type="hidden" name="imageUrls" value={imageUrl} />
              <img
                src={imageUrl}
                alt="商品圖片預覽"
                className="h-48 w-full rounded-3xl object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(values.filter((value) => value !== imageUrl))}
                className="text-sm font-semibold text-[#8e4b45]"
              >
                刪除這張圖片
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
