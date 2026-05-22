"use client";

import Link from "next/link";
import { useState } from "react";
import type { CategoryRecord, ProductRecord } from "@pet-showcase/shared";
import { Button, Card, Input, Textarea } from "@pet-showcase/ui";
import { ImageUpload } from "./image-upload";

export function ProductForm({
  initialValue,
  action,
  title,
  categories
}: {
  initialValue?: Partial<ProductRecord>;
  action: "create" | "update";
  title: string;
  categories: CategoryRecord[];
}) {
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialValue?.categoryId ?? "");
  const hasCategories = categories.length > 0;

  async function handleSubmit(formData: FormData) {
    setError("");

    const categoryId = String(formData.get("categoryId") ?? selectedCategoryId);

    if (!categoryId) {
      setError("請先選擇商品分類。");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: String(formData.get("name") ?? ""),
      price: Number(formData.get("price") ?? 0),
      imageUrl,
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "draft"),
      categoryId
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
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(result?.message ?? "儲存商品失敗，請稍後再試。");
      return;
    }

    window.location.href = "/products";
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-[var(--admin-border)] bg-[rgba(255,253,249,0.94)] px-5 py-5 shadow-[0_24px_80px_-42px_rgba(76,57,35,0.18)] md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            商品編輯
          </p>
          <h1 className="text-3xl font-bold text-[var(--admin-ink)]">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
            在這裡設定商品名稱、價格、圖片、描述與分類，完成後即可回到商品列表。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-brand-strong)] transition hover:border-[var(--admin-border-strong)]"
          >
            返回商品列表
          </Link>
          <Link
            href="/categories"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-white hover:text-[var(--admin-brand-strong)]"
          >
            管理分類
          </Link>
        </div>
      </div>

      <form action={handleSubmit} className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
        <Card className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[0_24px_80px_-42px_rgba(76,57,35,0.16)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
                商品資訊
              </p>
              <h2 className="text-xl font-semibold text-[var(--admin-ink)]">基本資料</h2>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="product-name"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
              >
                商品名稱
              </label>
              <Input
                id="product-name"
                name="name"
                defaultValue={initialValue?.name}
                placeholder="輸入商品名稱"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="product-price"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
                >
                  價格
                </label>
                <Input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={initialValue?.price}
                  placeholder="輸入價格"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="product-status"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
                >
                  發布狀態
                </label>
                <select
                  id="product-status"
                  name="status"
                  defaultValue={initialValue?.status ?? "draft"}
                  className="min-h-11 w-full rounded-3xl border border-[var(--admin-border)] bg-white px-4 text-sm text-[var(--admin-ink)] outline-none focus:border-[var(--admin-border-strong)]"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已發布</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="product-description"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
              >
                商品描述
              </label>
              <Textarea
                id="product-description"
                name="description"
                defaultValue={initialValue?.description}
                placeholder="輸入商品描述"
                required
              />
            </div>
          </div>
        </Card>

        <Card className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[0_24px_80px_-42px_rgba(76,57,35,0.16)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
                分類與圖片
              </p>
              <h2 className="text-xl font-semibold text-[var(--admin-ink)]">補充設定</h2>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="product-category"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
              >
                商品分類
              </label>
              <select
                id="product-category"
                name="categoryId"
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
                disabled={!hasCategories}
                className="min-h-11 w-full rounded-3xl border border-[var(--admin-border)] bg-white px-4 text-sm text-[var(--admin-ink)] outline-none focus:border-[var(--admin-border-strong)] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                required
              >
                <option value="">選擇一個分類</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-sm leading-6 text-[var(--admin-muted)]">
                {hasCategories
                  ? "建立好的分類會出現在這裡，前台也會用同一組分類做導覽。"
                  : "目前還沒有分類，請先到分類管理新增至少一個分類。"}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
              <ImageUpload value={imageUrl} onChange={setImageUrl} />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button
              type="submit"
              disabled={isSubmitting || !imageUrl || !hasCategories}
              className="w-full bg-[var(--admin-ink)] text-white hover:bg-[var(--admin-brand-strong)]"
            >
              {isSubmitting ? "儲存中..." : "儲存商品"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
