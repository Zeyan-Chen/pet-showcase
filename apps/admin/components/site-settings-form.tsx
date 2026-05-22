"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettingsRecord } from "@pet-showcase/shared";
import { Button, Card, Input } from "@pet-showcase/ui";

function normalizeAltText(value: string) {
  return value.trim() || "Rookie Gecko logo";
}

function extractCloudinaryPublicId(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const uploadMarker = "/upload/";
    const uploadIndex = parsedUrl.pathname.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return "";
    }

    const rawSegments = parsedUrl.pathname
      .slice(uploadIndex + uploadMarker.length)
      .split("/")
      .filter(Boolean);

    const pathSegments =
      rawSegments[0]?.startsWith("v") && /^\d+$/.test(rawSegments[0].slice(1))
        ? rawSegments.slice(1)
        : rawSegments;

    if (pathSegments.length === 0) {
      return "";
    }

    pathSegments[pathSegments.length - 1] = pathSegments[
      pathSegments.length - 1
    ].replace(/\.[^/.]+$/, "");

    return pathSegments.join("/");
  } catch {
    return "";
  }
}

export function SiteSettingsForm({
  initialValue,
}: {
  initialValue?: SiteSettingsRecord;
}) {
  const router = useRouter();
  const [logoImageUrl, setLogoImageUrl] = useState(
    initialValue?.logoImageUrl ?? "",
  );
  const [logoPublicId, setLogoPublicId] = useState(
    initialValue?.logoPublicId ?? "",
  );
  const [logoAlt, setLogoAlt] = useState(
    initialValue?.logoAlt ?? "Rookie Gecko logo",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const previewAlt = useMemo(() => normalizeAltText(logoAlt), [logoAlt]);

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("UPLOAD_FAILED");
      }

      const result = (await response.json()) as { imageUrl: string };
      const nextImageUrl = result.imageUrl;
      const nextPublicId = extractCloudinaryPublicId(nextImageUrl);

      if (!nextPublicId) {
        throw new Error("UPLOAD_PUBLIC_ID_MISSING");
      }

      setLogoImageUrl(nextImageUrl);
      setLogoPublicId(nextPublicId);
    } catch {
      setError("Logo 上傳失敗，請再試一次。");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit() {
    setError("");

    if (!logoImageUrl || !logoPublicId) {
      setError("請先上傳 Logo 圖片。");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        logoImageUrl,
        logoPublicId,
        logoAlt: previewAlt,
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setError(result?.message ?? "儲存站台設定失敗，請再試一次。");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
      <Card className="overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[0_20px_60px_-32px_rgba(76,57,35,0.16)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
              Logo Upload
            </p>
            <h2 className="text-2xl font-semibold text-[var(--admin-ink)]">
              上傳站台 Logo
            </h2>
            <p className="text-sm leading-6 text-[var(--admin-muted)]">
              上傳新的 Logo 後，前台會立即改用這張圖片。建議使用透明背景的
              PNG，桌機和手機版都會套用同一張圖。
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm text-[var(--admin-muted)]">
            {initialValue
              ? "目前已有設定中的站台 Logo，你可以直接替換成新的圖片。"
              : "目前尚未設定站台 Logo，上傳後前台的 Logo 位置就會改為顯示圖片。"}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="site-logo-file"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
            >
              Logo 圖片
            </label>
            <input
              id="site-logo-file"
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
              className="block w-full text-sm text-[var(--admin-muted)]"
            />
            <p className="text-sm text-[var(--admin-muted)]">
              建議上傳已去背的 PNG，像這次的 Rookie Gecko 圖檔就很適合。
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="site-logo-alt"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]"
            >
              Logo 替代文字
            </label>
            <Input
              id="site-logo-alt"
              name="logoAlt"
              value={logoAlt}
              onChange={(event) => setLogoAlt(event.target.value)}
              placeholder="例如 Rookie Gecko logo"
              maxLength={120}
              required
            />
          </div>

          {logoPublicId ? (
            <div className="rounded-[1.25rem] border border-[var(--admin-border)] bg-white px-4 py-3 text-xs text-[var(--admin-muted)]">
              Cloudinary public ID: {logoPublicId}
            </div>
          ) : null}

          {isUploading ? (
            <p className="text-sm text-[var(--admin-muted)]">Logo 上傳中...</p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isUploading || isSubmitting || !logoImageUrl || !previewAlt.trim()
            }
            className="w-full bg-[var(--admin-ink)] text-white hover:bg-[var(--admin-brand-strong)]"
          >
            {isSubmitting ? "儲存中..." : "儲存站台設定"}
          </Button>
        </div>
      </Card>

      <Card className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[0_20px_60px_-32px_rgba(76,57,35,0.16)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
              Preview
            </p>
            <h2 className="text-2xl font-semibold text-[var(--admin-ink)]">
              Logo 預覽
            </h2>
            <p className="text-sm leading-6 text-[var(--admin-muted)]">
              這裡會顯示目前即將套用到前台的 Logo。儲存成功後，前台 header 的
              Logo 區塊會立即改成這張圖。
            </p>
          </div>

          <section className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[linear-gradient(180deg,#fffdfa,#f7f1e8)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <div className="flex min-h-56 items-center justify-center rounded-[1.5rem] border border-dashed border-[var(--admin-border)] bg-white px-4 py-6">
              {logoImageUrl ? (
                <img
                  src={logoImageUrl}
                  alt={previewAlt}
                  className="max-h-44 w-full object-contain"
                />
              ) : (
                <div className="flex h-28 w-full max-w-xs items-center justify-center rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 text-center text-sm font-semibold text-[var(--admin-muted)]">
                  尚未設定 Logo
                </div>
              )}
            </div>
          </section>
        </div>
      </Card>
    </section>
  );
}
