"use client";

import { useState } from "react";

export function ImageUpload({
  value,
  onChange
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
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
      onChange(data.imageUrl);
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
        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
      />
      {isUploading ? <p className="text-sm text-stone-600">圖片上傳中...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {value ? <img src={value} alt="圖片預覽" className="h-48 w-full rounded-3xl object-cover" /> : null}
    </div>
  );
}
