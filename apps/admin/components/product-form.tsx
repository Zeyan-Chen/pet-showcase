"use client";

import { useState } from "react";
import type { ProductRecord } from "@pet-showcase/shared";
import { Button, Input, Textarea } from "@pet-showcase/ui";
import { ImageUpload } from "./image-upload";

export function ProductForm({
  initialValue,
  action,
  title
}: {
  initialValue?: Partial<ProductRecord>;
  action: "create" | "update";
  title: string;
}) {
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    const payload = {
      name: String(formData.get("name") ?? ""),
      price: Number(formData.get("price") ?? 0),
      imageUrl,
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "draft")
    };

    const endpoint = action === "create" ? "/api/products" : `/api/products/${initialValue?._id}`;
    const method = action === "create" ? "POST" : "PATCH";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Could not save product. Please check the form and try again.");
      return;
    }

    window.location.href = "/products";
  }

  return (
    <form action={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-bark">Product editor</p>
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <ImageUpload value={imageUrl} onChange={setImageUrl} />
      <Input name="name" defaultValue={initialValue?.name} placeholder="Product name" required />
      <Input
        name="price"
        type="number"
        min="0"
        defaultValue={initialValue?.price}
        placeholder="Price"
        required
      />
      <Textarea
        name="description"
        defaultValue={initialValue?.description}
        placeholder="Description"
        required
      />
      <select
        name="status"
        defaultValue={initialValue?.status ?? "draft"}
        className="min-h-11 rounded-3xl border border-stone-300 bg-white px-4 text-sm"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting || !imageUrl}>
        {isSubmitting ? "Saving..." : "Save product"}
      </Button>
    </form>
  );
}
