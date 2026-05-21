"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Textarea } from "@pet-showcase/ui";

export function AnnouncementForm({ announcementCount }: { announcementCount: number }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: String(formData.get("message") ?? ""),
        isActive: formData.get("isActive") === "on"
      })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("建立公告失敗，請稍後再試。");
      return;
    }

    setMessage("");
    setIsActive(true);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden border border-[#d8cdbf] bg-[#fffaf3] p-5 shadow-[0_20px_60px_-32px_rgba(16,38,63,0.22)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#214b7a]">
            公告設定
          </p>
          <h2 className="text-2xl font-semibold text-[#1f1a17]">新增前台公告</h2>
          <p className="text-sm leading-6 text-[#605850]">
            這裡設定的是前台最上方藍色細條的公告文字。你可以先建立一條，之後再逐步增加多條輪播內容。
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#ddd1c1] bg-[#f7f1e8] px-4 py-3 text-sm text-[#605850]">
          {announcementCount === 0
            ? "目前還沒有任何公告，新增後前台就能顯示。"
            : `目前共有 ${announcementCount} 則公告。`}
        </div>

        <form action={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="announcement-message"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d6359]"
            >
              公告文字
            </label>
            <Textarea
              id="announcement-message"
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="例如：本週新上架多隻巨人守宮，歡迎私訊詢問。"
              maxLength={160}
              className="min-h-28 border-[#d4c7b7] bg-white"
              required
            />
          </div>

          <label className="flex items-center gap-3 rounded-[1.25rem] border border-[#ddd1c1] bg-[#f7f1e8] px-4 py-3 text-sm text-[#3d352f]">
            <input
              type="checkbox"
              name="isActive"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 accent-[#214b7a]"
            />
            建立後立即啟用這則公告
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full bg-[#214b7a] text-white"
          >
            {isSubmitting ? "建立中..." : "新增公告"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
