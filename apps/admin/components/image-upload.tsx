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
        throw new Error("Upload failed");
      }

      const data = (await response.json()) as { imageUrl: string };
      onChange(data.imageUrl);
    } catch {
      setError("Image upload failed. Please try again.");
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
      {isUploading ? <p className="text-sm text-stone-600">Uploading...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {value ? <img src={value} alt="Preview" className="h-48 w-full rounded-3xl object-cover" /> : null}
    </div>
  );
}
