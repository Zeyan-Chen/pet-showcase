"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@pet-showcase/ui";

export function CategoryForm({ categoryCount }: { categoryCount: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: String(formData.get("name") ?? "")
      })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("新增分類失敗，請檢查名稱後再試一次。");
      return;
    }

    setName("");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[0_20px_60px_-32px_rgba(76,57,35,0.16)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            分類設定
          </p>
          <h2 className="text-2xl font-semibold text-[var(--admin-ink)]">新增品種分類</h2>
          <p className="text-sm leading-6 text-[var(--admin-muted)]">
            先建立品種分類，之後新增商品時就能直接套用，前台導覽也會同步顯示。
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm text-[var(--admin-muted)]">
          {categoryCount === 0
            ? "目前還沒有分類，先建立第一個品種分類吧。"
            : `目前已建立 ${categoryCount} 個分類。`}
        </div>

        <form action={handleSubmit} className="space-y-3">
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
              placeholder="例如：睫角守宮"
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
