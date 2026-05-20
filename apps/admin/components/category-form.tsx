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
      setError("新增分類失敗，請檢查名稱是否重複後再試一次。");
      return;
    }

    setName("");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden border border-stone-200/70 bg-white/95 p-5 shadow-[0_20px_60px_-32px_rgba(52,34,18,0.45)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-bark/70">
            分類表單
          </p>
          <h2 className="text-2xl font-semibold text-stone-950">新增守宮品種</h2>
          <p className="text-sm leading-6 text-stone-600">
            新增之後，這個分類會出現在商品表單與前台分類導覽中，方便你按守宮品種整理展示內容。
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/90 px-4 py-3 text-sm text-stone-600">
          {categoryCount === 0
            ? "目前還沒有任何分類，先新增第一個守宮品種吧。"
            : `目前已建立 ${categoryCount} 個分類。`}
        </div>

        <form action={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="category-name"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500"
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

          <Button type="submit" disabled={isSubmitting || !name.trim()} className="w-full">
            {isSubmitting ? "新增中..." : "新增分類"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
