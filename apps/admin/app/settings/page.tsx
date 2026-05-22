import Link from "next/link";
import { getSiteSettings } from "../../lib/site-settings";
import { SiteSettingsForm } from "../../components/site-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border border-[var(--admin-border)] bg-[linear-gradient(180deg,rgba(255,253,249,0.98),rgba(247,241,232,0.98))] px-5 py-5 shadow-[0_28px_70px_-42px_rgba(76,57,35,0.16)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--admin-muted)]">
              Site Settings
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-white hover:text-[var(--admin-brand-strong)]"
              >
                商品
              </Link>
              <Link
                href="/categories"
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-white hover:text-[var(--admin-brand-strong)]"
              >
                分類
              </Link>
              <Link
                href="/announcements"
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-white hover:text-[var(--admin-brand-strong)]"
              >
                公告
              </Link>
              <span className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-brand-strong)] shadow-[0_10px_24px_rgba(76,57,35,0.08)]">
                站台設定
              </span>
            </div>
          </div>

          <div className="space-y-2 lg:max-w-xl lg:text-right">
            <h1 className="text-3xl font-bold text-[var(--admin-ink)]">站台設定</h1>
            <p className="text-sm leading-6 text-[var(--admin-muted)]">
              這裡可以管理前台共用的品牌設定。這次先從 Logo 開始，之後如果需要，也可以再擴充成更多全站視覺設定。
            </p>
          </div>
        </div>
      </section>

      <SiteSettingsForm initialValue={settings ?? undefined} />
    </main>
  );
}
