"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
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
  const [imageUrls, setImageUrls] = useState(
    initialValue?.imageUrls && initialValue.imageUrls.length > 0
      ? initialValue.imageUrls
      : initialValue?.imageUrl
        ? [initialValue.imageUrl]
        : []
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState(
    initialValue?.mainCategoryId ?? ""
  );
  const [selectedChildCategoryId, setSelectedChildCategoryId] = useState(
    initialValue?.childCategoryId ?? ""
  );

  const mainCategories = useMemo(
    () => categories.filter((category) => category.parentCategoryId === null),
    [categories]
  );
  const childCategories = useMemo(
    () => categories.filter((category) => category.parentCategoryId === selectedMainCategoryId),
    [categories, selectedMainCategoryId]
  );
  const hasMainCategories = mainCategories.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    const mainCategoryId = String(formData.get("mainCategoryId") ?? selectedMainCategoryId);
    const childCategoryId =
      String(formData.get("childCategoryId") ?? selectedChildCategoryId) || null;

    if (!mainCategoryId) {
      setError("請先選擇主分類。");
      return;
    }

    setIsSubmitting(true);
    const effectiveImageUrls = formData.getAll("imageUrls").map(String).filter(Boolean);

    const payload = {
      name: String(formData.get("name") ?? ""),
      price: Number(formData.get("price") ?? 0),
      imageUrl: effectiveImageUrls[0] ?? "",
      imageUrls: effectiveImageUrls,
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "draft"),
      isSoldOut: formData.get("isSoldOut") === "on",
      mainCategoryId,
      childCategoryId
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
            先選主分類，再視需要選擇細項分類；沒有細項時只存主分類即可。
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

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
        <Card className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[0_24px_80px_-42px_rgba(76,57,35,0.16)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
                商品內容
              </p>
              <h2 className="text-xl font-semibold text-[var(--admin-ink)]">基本資訊</h2>
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
                placeholder="請輸入商品名稱"
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
                  placeholder="請輸入價格"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="product-status"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
                >
                  狀態
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

            <label className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3">
              <input
                type="checkbox"
                name="isSoldOut"
                defaultChecked={initialValue?.isSoldOut ?? false}
                className="mt-1 h-4 w-4 rounded border-[var(--admin-border)] text-[var(--admin-brand-strong)] focus:ring-[var(--admin-brand-strong)]"
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-[var(--admin-ink)]">售罄狀態</span>
                <span className="block text-sm leading-6 text-[var(--admin-muted)]">
                  勾選後商品仍會顯示在前台，但卡片會加上售罄標籤並停用點擊。
                </span>
              </span>
            </label>

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
                placeholder="請輸入商品描述"
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
              <h2 className="text-xl font-semibold text-[var(--admin-ink)]">分類設定</h2>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="product-main-category"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
              >
                主分類
              </label>
              <select
                id="product-main-category"
                name="mainCategoryId"
                value={selectedMainCategoryId}
                onChange={(event) => {
                  setSelectedMainCategoryId(event.target.value);
                  setSelectedChildCategoryId("");
                }}
                disabled={!hasMainCategories}
                className="min-h-11 w-full rounded-3xl border border-[var(--admin-border)] bg-white px-4 text-sm text-[var(--admin-ink)] outline-none focus:border-[var(--admin-border-strong)] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                required
              >
                <option value="">請選擇主分類</option>
                {mainCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="product-child-category"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
              >
                細項分類
              </label>
              <select
                id="product-child-category"
                name="childCategoryId"
                value={selectedChildCategoryId}
                onChange={(event) => setSelectedChildCategoryId(event.target.value)}
                disabled={!selectedMainCategoryId || childCategories.length === 0}
                className="min-h-11 w-full rounded-3xl border border-[var(--admin-border)] bg-white px-4 text-sm text-[var(--admin-ink)] outline-none focus:border-[var(--admin-border-strong)] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
              >
                <option value="">不指定細項</option>
                {childCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-sm leading-6 text-[var(--admin-muted)]">
                {selectedMainCategoryId && childCategories.length > 0
                  ? "如果這個主分類底下有更細的品項，可以在這裡再往下指定。"
                  : "如果目前沒有細項，保留空白即可。"}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
              <ImageUpload values={imageUrls} onChange={setImageUrls} />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button
              type="submit"
              disabled={isSubmitting || imageUrls.length === 0 || !hasMainCategories}
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
