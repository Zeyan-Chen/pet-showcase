"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnnouncementRecord } from "@pet-showcase/shared";
import { Button, Card, Textarea } from "@pet-showcase/ui";

function getErrorMessage(fallback: string, payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

export function AnnouncementTable({ announcements }: { announcements: AnnouncementRecord[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [draftIsActive, setDraftIsActive] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleSave(id: string) {
    setError("");
    setPendingId(id);

    const response = await fetch(`/api/announcements/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: draftMessage,
        isActive: draftIsActive
      })
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    setPendingId(null);

    if (!response.ok) {
      setError(getErrorMessage("更新公告失敗，請稍後再試。", payload));
      return;
    }

    setEditingId(null);
    setDraftMessage("");
    setDraftIsActive(true);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleToggle(record: AnnouncementRecord) {
    setError("");
    setPendingId(record._id);

    const response = await fetch(`/api/announcements/${record._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: record.message,
        isActive: !record.isActive
      })
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    setPendingId(null);

    if (!response.ok) {
      setError(getErrorMessage("切換公告狀態失敗，請稍後再試。", payload));
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("確定要刪除這則公告嗎？刪除後無法復原。");

    if (!confirmed) {
      return;
    }

    setError("");
    setPendingId(id);

    const response = await fetch(`/api/announcements/${id}`, {
      method: "DELETE"
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    setPendingId(null);

    if (!response.ok) {
      setError(getErrorMessage("刪除公告失敗，請稍後再試。", payload));
      return;
    }

    if (editingId === id) {
      setEditingId(null);
      setDraftMessage("");
      setDraftIsActive(true);
    }

    startTransition(() => {
      router.refresh();
    });
  }

  if (announcements.length === 0) {
    return (
      <Card className="border border-dashed border-[#d4c7b7] bg-[#fffaf3] p-8 text-center shadow-none">
        <p className="text-base font-semibold text-[#1f1a17]">目前還沒有公告</p>
        <p className="mt-2 text-sm leading-6 text-[#605850]">
          先新增一則公告後，前台上方藍色細條就會開始顯示。
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

      {announcements.map((announcement) => {
        const isEditing = editingId === announcement._id;
        const isPending = pendingId === announcement._id;

        return (
          <Card
            key={announcement._id}
            className="border border-[#d8cdbf] bg-[#fffaf3] p-4 shadow-[0_18px_50px_-36px_rgba(16,38,63,0.24)]"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    announcement.isActive
                      ? "bg-[#dbe8f6] text-[#214b7a]"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {announcement.isActive ? "啟用中" : "已停用"}
                </span>
                <span className="text-xs text-[#746b63]">
                  建立於 {new Date(announcement.createdAt).toLocaleString("zh-TW")}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    maxLength={160}
                    className="min-h-28 border-[#d4c7b7] bg-white"
                    autoFocus
                  />
                  <label className="flex items-center gap-3 rounded-[1.25rem] border border-[#ddd1c1] bg-[#f7f1e8] px-4 py-3 text-sm text-[#3d352f]">
                    <input
                      type="checkbox"
                      checked={draftIsActive}
                      onChange={(event) => setDraftIsActive(event.target.checked)}
                      className="h-4 w-4 accent-[#214b7a]"
                    />
                    這則公告目前啟用
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={isPending || !draftMessage.trim()}
                      onClick={() => handleSave(announcement._id)}
                      className="bg-[#214b7a]"
                    >
                      {isPending ? "儲存中..." : "儲存修改"}
                    </Button>
                    <button
                      type="button"
                      className="min-h-11 rounded-3xl border border-[#cfc1b0] bg-white/80 px-4 py-3 text-sm font-semibold text-[#3d352f] transition hover:border-[#214b7a] hover:text-[#214b7a]"
                      onClick={() => {
                        setEditingId(null);
                        setDraftMessage("");
                        setDraftIsActive(true);
                        setError("");
                      }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <p className="max-w-3xl text-sm leading-7 text-[#332d29]">{announcement.message}</p>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      type="button"
                      className="min-h-11 rounded-3xl border border-[#cfc1b0] bg-white/80 px-4 py-3 text-sm font-semibold text-[#3d352f] transition hover:border-[#214b7a] hover:text-[#214b7a]"
                      onClick={() => {
                        setEditingId(announcement._id);
                        setDraftMessage(announcement.message);
                        setDraftIsActive(announcement.isActive);
                        setError("");
                      }}
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="min-h-11 rounded-3xl border border-[#cfc1b0] bg-white/80 px-4 py-3 text-sm font-semibold text-[#3d352f] transition hover:border-[#214b7a] hover:text-[#214b7a]"
                      disabled={isPending}
                      onClick={() => handleToggle(announcement)}
                    >
                      {announcement.isActive ? "停用" : "啟用"}
                    </button>
                    <Button
                      type="button"
                      className="bg-red-700"
                      disabled={isPending}
                      onClick={() => handleDelete(announcement._id)}
                    >
                      {isPending ? "刪除中..." : "刪除"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
