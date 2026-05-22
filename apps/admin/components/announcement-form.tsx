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
      setError("新增公告失敗，請再試一次。");
      return;
    }

    setMessage("");
    setIsActive(true);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[0_20px_60px_-32px_rgba(76,57,35,0.16)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            公告設定
          </p>
          <h2 className="text-2xl font-semibold text-[var(--admin-ink)]">新增公告</h2>
          <p className="text-sm leading-6 text-[var(--admin-muted)]">
            前台上方藍色細條會輪播啟用中的公告，這裡建立的文字會直接同步到前台。
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm text-[var(--admin-muted)]">
          {announcementCount === 0
            ? "目前還沒有公告，先新增第一則訊息吧。"
            : `目前共有 ${announcementCount} 則公告。`}
        </div>

        <form action={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="announcement-message"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
            >
              公告內容
            </label>
            <Textarea
              id="announcement-message"
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="例如：今日上架巨人守宮，歡迎私訊詢問。"
              maxLength={160}
              className="min-h-28 border-[var(--admin-border)] bg-white"
              required
            />
          </div>

          <label className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm text-[var(--admin-brand-strong)]">
            <input
              type="checkbox"
              name="isActive"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 accent-[var(--admin-brand-strong)]"
            />
            建立後立即在前台顯示
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full bg-[var(--admin-ink)] text-white hover:bg-[var(--admin-brand-strong)]"
          >
            {isSubmitting ? "新增中..." : "新增公告"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
