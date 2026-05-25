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

export function CategoryTable({ categories }: { categories: CategoryRecord[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
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
        parentCategoryId: category.parentCategoryId
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

  function renderCategoryRow(category: CategoryRecord, depth: "main" | "child") {
    const isEditing = editingId === category._id;
    const isPending = pendingId === category._id;

    return (
      <div
        key={category._id}
        className={`rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 ${
          depth === "child" ? "ml-4" : ""
        }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={isPending || !draftName.trim()}
                    onClick={() => handleRename(category)}
                    className="bg-[var(--admin-ink)] text-white hover:bg-[var(--admin-brand-strong)]"
                  >
                    {isPending ? "儲存中..." : "儲存名稱"}
                  </Button>
                  <button
                    type="button"
                    className="min-h-11 rounded-full border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:border-[var(--admin-border-strong)] hover:text-[var(--admin-brand-strong)]"
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
                <h3 className="truncate text-lg font-semibold text-[var(--admin-ink)]">
                  {category.name}
                </h3>
                <p className="text-sm text-[var(--admin-muted)]">Slug：{category.slug}</p>
              </>
            )}
          </div>

          {!isEditing ? (
            <div className="flex flex-wrap gap-2 md:justify-end">
              <button
                type="button"
                className="min-h-11 rounded-full border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-brand-strong)] transition hover:border-[var(--admin-border-strong)]"
                onClick={() => {
                  setEditingId(category._id);
                  setDraftName(category.name);
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
        <p className="text-base font-semibold text-[var(--admin-ink)]">目前還沒有分類</p>
        <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
          先建立主分類，之後再依需要往下新增細項。
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
