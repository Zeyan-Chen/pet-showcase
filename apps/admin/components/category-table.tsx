"use client";

import { startTransition, useMemo, useState } from "react";
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

function getCategoryStatus(category: CategoryRecord) {
  if (category.parentCategoryId) {
    return "跟隨主分類";
  }

  return category.includeInAllListing ? "納入全部展示" : "不納入全部展示";
}

export function CategoryTable({ categories }: { categories: CategoryRecord[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftIncludeInAllListing, setDraftIncludeInAllListing] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const groupedCategories = useMemo(() => {
    const mainCategories = categories
      .filter((category) => category.parentCategoryId === null)
      .sort((left, right) => left.name.localeCompare(right.name));

    return mainCategories.map((mainCategory) => ({
      ...mainCategory,
      children: categories
        .filter((category) => category.parentCategoryId === mainCategory._id)
        .sort((left, right) => left.name.localeCompare(right.name))
    }));
  }, [categories]);

  async function handleRename(category: CategoryRecord) {
    setError("");
    setPendingId(category._id);

    const response = await fetch(`/api/categories/${category._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: draftName,
        parentCategoryId: category.parentCategoryId,
        includeInAllListing: category.parentCategoryId ? true : draftIncludeInAllListing
      })
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    setPendingId(null);

    if (!response.ok) {
      setError(getErrorMessage("更新分類時發生問題，請稍後再試。", payload));
      return;
    }

    setEditingId(null);
    setDraftName("");
    setDraftIncludeInAllListing(true);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(`確定要刪除「${name}」嗎？`);

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
      setError(getErrorMessage("刪除分類時發生問題，請稍後再試。", payload));
      return;
    }

    if (editingId === id) {
      setEditingId(null);
      setDraftName("");
      setDraftIncludeInAllListing(true);
    }

    startTransition(() => {
      router.refresh();
    });
  }

  function renderCategoryRow(category: CategoryRecord, depth: "main" | "child") {
    const isEditing = editingId === category._id;
    const isPending = pendingId === category._id;
    const isTopLevel = depth === "main";

    return (
      <div
        key={category._id}
        className={`rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 ${
          depth === "child"
            ? "border-l-4 border-l-[var(--admin-brand-soft)] bg-[var(--admin-surface-2)] pl-5"
            : ""
        }`}
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
              {depth === "main" ? "主分類" : "細項分類"}
            </p>
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  maxLength={80}
                  autoFocus
                />
                {isTopLevel ? (
                  <label className="flex items-center justify-between gap-4 rounded-[1rem] border border-[var(--admin-border)] bg-white px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--admin-ink)]">納入全部展示</p>
                      <p className="text-xs text-[var(--admin-muted)]">
                        關閉後，這個主分類與其細項商品會從前台「全部」頁移除。
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={draftIncludeInAllListing}
                      onChange={(event) => setDraftIncludeInAllListing(event.target.checked)}
                      className="h-5 w-5 shrink-0 accent-[var(--admin-brand-strong)]"
                    />
                  </label>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={isPending || !draftName.trim()}
                    onClick={() => handleRename(category)}
                    className="bg-[var(--admin-ink)] text-white hover:bg-[var(--admin-brand-strong)]"
                  >
                    {isPending ? "儲存中..." : "儲存變更"}
                  </Button>
                  <button
                    type="button"
                    className="min-h-11 rounded-full border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:border-[var(--admin-border-strong)] hover:text-[var(--admin-brand-strong)]"
                    onClick={() => {
                      setEditingId(null);
                      setDraftName("");
                      setDraftIncludeInAllListing(true);
                      setError("");
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="truncate text-lg font-semibold text-[var(--admin-ink)]">
                  {category.name}
                </h3>
                <p className="text-sm text-[var(--admin-muted)]">Slug：{category.slug}</p>
                <p className="text-sm text-[var(--admin-muted)]">{getCategoryStatus(category)}</p>
              </>
            )}
          </div>

          {!isEditing ? (
            <div className="flex flex-wrap items-start gap-2 md:w-[11rem] md:justify-end">
              <button
                type="button"
                className="min-h-11 rounded-full border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-brand-strong)] transition hover:border-[var(--admin-border-strong)]"
                onClick={() => {
                  setEditingId(category._id);
                  setDraftName(category.name);
                  setDraftIncludeInAllListing(category.includeInAllListing);
                  setError("");
                }}
              >
                修改名稱
              </button>
              <Button
                type="button"
                className="bg-[#8e4b45] text-white hover:bg-[#7b3e39]"
                disabled={isPending}
                onClick={() => handleDelete(category._id, category.name)}
              >
                {isPending ? "刪除中..." : "刪除"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Card className="border border-dashed border-[var(--admin-border)] bg-[var(--admin-card)] p-8 text-center shadow-none">
        <p className="text-base font-semibold text-[var(--admin-ink)]">目前還沒有任何分類</p>
        <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
          先建立主分類或細項分類，之後新增商品時就能直接套用。
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

      {groupedCategories.map((mainCategory) => (
        <div key={mainCategory._id} className="space-y-3">
          {renderCategoryRow(mainCategory, "main")}
          {mainCategory.children.map((childCategory) => renderCategoryRow(childCategory, "child"))}
        </div>
      ))}
    </div>
  );
}
