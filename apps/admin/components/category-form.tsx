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
      setError("無法建立分類，請嘗試其他名稱或稍後再試。");
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
            分類設定
          </p>
          <h2 className="text-2xl font-semibold text-stone-950">新增品種類別</h2>
          <p className="text-sm leading-6 text-stone-600">
            分類會用在商品歸類與前台導覽。名稱建議保持精簡，方便瀏覽與篩選。
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/90 px-4 py-3 text-sm text-stone-600">
          {categoryCount === 0
            ? "目前還沒有分類，先建立第一個分類後再發布新商品。"
            : `目前後台已有 ${categoryCount} 個分類。`}
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
              placeholder="Leachianus"
              maxLength={80}
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={isSubmitting || !name.trim()} className="w-full">
            {isSubmitting ? "建立中..." : "建立分類"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
