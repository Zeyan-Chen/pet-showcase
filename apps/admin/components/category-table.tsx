"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRecord } from "@pet-showcase/shared";
import { Button, Card, Input } from "@pet-showcase/ui";

function getErrorMessage(fallback: string, payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

export function CategoryTable({ categories }: { categories: CategoryRecord[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleRename(id: string) {
    setError("");
    setPendingId(id);

    const response = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: draftName
      })
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    setPendingId(null);

    if (!response.ok) {
      setError(getErrorMessage("更新分類失敗，請稍後再試。", payload));
      return;
    }

    setEditingId(null);
    setDraftName("");
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(`確定要刪除「${name}」嗎？刪除後無法復原。`);

    if (!confirmed) {
      return;
    }

    setError("");
    setPendingId(id);

    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE"
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    setPendingId(null);

    if (!response.ok) {
      setError(getErrorMessage("刪除分類失敗，請稍後再試。", payload));
      return;
    }

    if (editingId === id) {
      setEditingId(null);
      setDraftName("");
    }

    startTransition(() => {
      router.refresh();
    });
  }

  if (categories.length === 0) {
    return (
      <Card className="border border-dashed border-stone-300 bg-white/70 p-8 text-center shadow-none">
        <p className="text-base font-semibold text-stone-900">目前沒有任何分類</p>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          先建立守宮品種分類，之後新增商品時就能直接指定所屬品種。
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <Card className="border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-none">
          {error}
        </Card>
      ) : null}

      {categories.map((category) => {
        const isEditing = editingId === category._id;
        const isPending = pendingId === category._id;

        return (
          <Card
            key={category._id}
            className="border border-stone-200/70 bg-white/95 p-4 shadow-[0_18px_50px_-36px_rgba(52,34,18,0.55)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  品種分類
                </p>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      maxLength={80}
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={isPending || !draftName.trim()}
                        onClick={() => handleRename(category._id)}
                      >
                        {isPending ? "儲存中..." : "儲存名稱"}
                      </Button>
                      <button
                        type="button"
                        className="min-h-11 rounded-3xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400"
                        onClick={() => {
                          setEditingId(null);
                          setDraftName("");
                          setError("");
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="truncate text-lg font-semibold text-stone-950">{category.name}</h3>
                    <p className="text-sm text-stone-600">Slug：{category.slug}</p>
                  </>
                )}
              </div>

              {!isEditing ? (
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button
                    type="button"
                    className="min-h-11 rounded-3xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-bark hover:text-bark"
                    onClick={() => {
                      setEditingId(category._id);
                      setDraftName(category.name);
                      setError("");
                    }}
                  >
                    重新命名
                  </button>
                  <Button
                    type="button"
                    className="bg-red-700"
                    disabled={isPending}
                    onClick={() => handleDelete(category._id, category.name)}
                  >
                    {isPending ? "刪除中..." : "刪除"}
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
