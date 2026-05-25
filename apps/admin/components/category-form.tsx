"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRecord } from "@pet-showcase/shared";
import { Button, Card, Input } from "@pet-showcase/ui";

export function CategoryForm({
  categories,
  categoryCount
}: {
  categories: CategoryRecord[];
  categoryCount: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mainCategories = useMemo(
    () => categories.filter((category) => category.parentCategoryId === null),
    [categories]
  );

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        parentCategoryId: String(formData.get("parentCategoryId") ?? "") || null
      })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "新增分類失敗，請稍後再試。");
      return;
    }

    setName("");
    setParentCategoryId("");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[0_20px_60px_-32px_rgba(76,57,35,0.16)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            分類管理
          </p>
          <h2 className="text-2xl font-semibold text-[var(--admin-ink)]">新增主分類或細項</h2>
          <p className="text-sm leading-6 text-[var(--admin-muted)]">
            不選上層分類時會建立主分類；選了上層分類後，會建立該主分類底下的細項。
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm text-[var(--admin-muted)]">
          目前共有 {categoryCount} 個分類項目。
        </div>

        <form action={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="parent-category"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
            >
              上層主分類
            </label>
            <select
              id="parent-category"
              name="parentCategoryId"
              value={parentCategoryId}
              onChange={(event) => setParentCategoryId(event.target.value)}
              className="min-h-11 w-full rounded-3xl border border-[var(--admin-border)] bg-white px-4 text-sm text-[var(--admin-ink)] outline-none focus:border-[var(--admin-border-strong)]"
            >
              <option value="">建立為主分類</option>
              {mainCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category-name"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
            >
              分類名稱
            </label>
            <Input
              id="category-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：守宮、睫角守宮"
              maxLength={80}
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full bg-[var(--admin-ink)] text-white hover:bg-[var(--admin-brand-strong)]"
          >
            {isSubmitting ? "新增中..." : "新增分類"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
